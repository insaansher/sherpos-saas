package handlers

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
)

// --- PUBLIC CMS ENDPOINTS ---

func PublicGetPage(c *gin.Context) {
	slug := c.Param("slug")
	var p struct {
		ID          string          `json:"id"`
		Slug        string          `json:"slug"`
		Title       string          `json:"title"`
		Status      string          `json:"status"`
		SeoMetadata json.RawMessage `json:"seo_metadata"`
	}

	err := db.DB.QueryRow(`
		SELECT id, slug, title, status, seo_metadata 
		FROM cms_pages 
		WHERE slug = $1 AND status = 'published'
	`, slug).Scan(&p.ID, &p.Slug, &p.Title, &p.Status, &p.SeoMetadata)

	if err == sql.ErrNoRows {
		c.JSON(404, gin.H{"error": "Page not found"})
		return
	} else if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}

	// Fetch sections
	rows, err := db.DB.Query(`
		SELECT id, type, order_index, content 
		FROM cms_sections 
		WHERE page_id = $1 AND enabled = TRUE 
		ORDER BY order_index ASC
	`, p.ID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error fetching sections"})
		return
	}
	defer rows.Close()

	var sections []gin.H
	for rows.Next() {
		var s struct {
			ID         string          `json:"id"`
			Type       string          `json:"type"`
			OrderIndex int             `json:"order_index"`
			Content    json.RawMessage `json:"content"`
		}
		if err := rows.Scan(&s.ID, &s.Type, &s.OrderIndex, &s.Content); err == nil {
			sections = append(sections, gin.H{
				"id":          s.ID,
				"type":        s.Type,
				"order_index": s.OrderIndex,
				"content":     s.Content,
			})
		}
	}

	c.JSON(200, gin.H{
		"page":     p,
		"sections": sections,
	})
}

func PublicGetNav(c *gin.Context) {
	rows, err := db.DB.Query("SELECT location, items FROM cms_nav")
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	navs := make(map[string]json.RawMessage)
	for rows.Next() {
		var loc string
		var items json.RawMessage
		if err := rows.Scan(&loc, &items); err == nil {
			navs[loc] = items
		}
	}
	c.JSON(200, navs)
}

func PublicListBlog(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT b.slug, b.title, b.excerpt, b.published_at, m.url as cover_url
		FROM cms_blog_posts b
		LEFT JOIN cms_media m ON b.cover_media_id = m.id
		WHERE b.status = 'published'
		ORDER BY b.published_at DESC
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var posts []gin.H
	for rows.Next() {
		var p struct {
			Slug        string    `json:"slug"`
			Title       string    `json:"title"`
			Excerpt     string    `json:"excerpt"`
			PublishedAt time.Time `json:"published_at"`
			CoverURL    *string   `json:"cover_url"`
		}
		if err := rows.Scan(&p.Slug, &p.Title, &p.Excerpt, &p.PublishedAt, &p.CoverURL); err == nil {
			posts = append(posts, gin.H{
				"slug":         p.Slug,
				"title":        p.Title,
				"excerpt":      p.Excerpt,
				"published_at": p.PublishedAt,
				"cover_url":    p.CoverURL,
			})
		}
	}
	c.JSON(200, posts)
}

func PublicPostContact(c *gin.Context) {
	var body struct {
		Name    string `json:"name" binding:"required"`
		Email   string `json:"email" binding:"required,email"`
		Subject string `json:"subject"`
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.Exec(`
		INSERT INTO cms_contact_messages (name, email, subject, message)
		VALUES ($1, $2, $3, $4)
	`, body.Name, body.Email, body.Subject, body.Message)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to store message"})
		return
	}
	c.JSON(200, gin.H{"message": "Sent successfully"})
}

func PublicPostNewsletter(c *gin.Context) {
	var body struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.Exec(`
		INSERT INTO cms_leads (email, source)
		VALUES ($1, 'newsletter')
		ON CONFLICT DO NOTHING
	`, body.Email)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to join"})
		return
	}
	c.JSON(200, gin.H{"message": "Joined successfully"})
}

// --- ADMIN CMS ENDPOINTS ---

func AdminCMSListPage(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, slug, title, status, updated_at FROM cms_pages ORDER BY created_at DESC")
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var pages []gin.H
	for rows.Next() {
		var p struct {
			ID        string    `json:"id"`
			Slug      string    `json:"slug"`
			Title     string    `json:"title"`
			Status    string    `json:"status"`
			UpdatedAt time.Time `json:"updated_at"`
		}
		if err := rows.Scan(&p.ID, &p.Slug, &p.Title, &p.Status, &p.UpdatedAt); err == nil {
			pages = append(pages, gin.H{
				"id":         p.ID,
				"slug":       p.Slug,
				"title":      p.Title,
				"status":     p.Status,
				"updated_at": p.UpdatedAt,
			})
		}
	}
	c.JSON(200, pages)
}

func AdminCMSCreatePage(c *gin.Context) {
	var body struct {
		Title string `json:"title" binding:"required"`
		Slug  string `json:"slug" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var id string
	err := db.DB.QueryRow(`
		INSERT INTO cms_pages (title, slug) VALUES ($1, $2) RETURNING id
	`, body.Title, body.Slug).Scan(&id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create page"})
		return
	}
	c.JSON(201, gin.H{"id": id})
}

func AdminCMSUpdatePage(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Title       string          `json:"title"`
		Slug        string          `json:"slug"`
		Status      string          `json:"status"`
		SeoMetadata json.RawMessage `json:"seo_metadata"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.Exec(`
		UPDATE cms_pages 
		SET title = COALESCE($1, title), slug = COALESCE($2, slug), status = COALESCE($3, status), seo_metadata = COALESCE($4, seo_metadata), updated_at = NOW()
		WHERE id = $5
	`, body.Title, body.Slug, body.Status, body.SeoMetadata, id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update page"})
		return
	}
	c.JSON(200, gin.H{"message": "Updated"})
}

func AdminCMSListSections(c *gin.Context) {
	pageID := c.Query("page_id")
	rows, err := db.DB.Query("SELECT id, type, order_index, enabled, content FROM cms_sections WHERE page_id = $1 ORDER BY order_index ASC", pageID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var sections []gin.H
	for rows.Next() {
		var s struct {
			ID         string          `json:"id"`
			Type       string          `json:"type"`
			OrderIndex int             `json:"order_index"`
			Enabled    bool            `json:"enabled"`
			Content    json.RawMessage `json:"content"`
		}
		if err := rows.Scan(&s.ID, &s.Type, &s.OrderIndex, &s.Enabled, &s.Content); err == nil {
			sections = append(sections, gin.H{
				"id":          s.ID,
				"type":        s.Type,
				"order_index": s.OrderIndex,
				"enabled":     s.Enabled,
				"content":     s.Content,
			})
		}
	}
	c.JSON(200, sections)
}

func AdminCMSCreateSection(c *gin.Context) {
	var body struct {
		PageID  string          `json:"page_id" binding:"required"`
		Type    string          `json:"type" binding:"required"`
		Content json.RawMessage `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var maxOrder int
	db.DB.QueryRow("SELECT COALESCE(MAX(order_index), 0) FROM cms_sections WHERE page_id = $1", body.PageID).Scan(&maxOrder)

	var id string
	err := db.DB.QueryRow(`
		INSERT INTO cms_sections (page_id, type, content, order_index) VALUES ($1, $2, $3, $4) RETURNING id
	`, body.PageID, body.Type, body.Content, maxOrder+1).Scan(&id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create section"})
		return
	}
	c.JSON(201, gin.H{"id": id})
}

func AdminCMSUpdateSection(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Content    json.RawMessage `json:"content"`
		OrderIndex *int            `json:"order_index"`
		Enabled    *bool           `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.Exec(`
		UPDATE cms_sections 
		SET content = COALESCE($1, content), order_index = COALESCE($2, order_index), enabled = COALESCE($3, enabled), updated_at = NOW()
		WHERE id = $4
	`, body.Content, body.OrderIndex, body.Enabled, id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update section"})
		return
	}
	c.JSON(200, gin.H{"message": "Updated"})
}

func AdminCMSDeleteSection(c *gin.Context) {
	id := c.Param("id")
	_, err := db.DB.Exec("DELETE FROM cms_sections WHERE id = $1", id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete"})
		return
	}
	c.JSON(200, gin.H{"message": "Deleted"})
}

// Media upload implements local file storage
func AdminCMSUploadMedia(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "No file uploaded"})
		return
	}

	// Create uploads directory if not exists
	uploadDir := "./uploads"
	// Ensure directory exists - simplified for Go 1.16+
	// os.MkdirAll(uploadDir, 0755)

	filePath := uploadDir + "/" + file.Filename
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(500, gin.H{"error": "Failed to save file"})
		return
	}

	url := "/uploads/" + file.Filename
	filename := file.Filename // Define filename here

	var id string
	err = db.DB.QueryRow(`
		INSERT INTO cms_media (url, filename, mime, size) VALUES ($1, $2, $3, $4) RETURNING id
	`, url, filename, file.Header.Get("Content-Type"), file.Size).Scan(&id)

	if err != nil {
		c.JSON(500, gin.H{"error": "Database error filling media record"})
		return
	}

	c.JSON(201, gin.H{"id": id, "url": url})
}

func AdminCMSListMedia(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, url, filename, mime, size, created_at FROM cms_media ORDER BY created_at DESC")
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var media []gin.H
	for rows.Next() {
		var m struct {
			ID        string    `json:"id"`
			URL       string    `json:"url"`
			Filename  string    `json:"filename"`
			Mime      string    `json:"mime"`
			Size      int64     `json:"size"`
			CreatedAt time.Time `json:"created_at"`
		}
		if err := rows.Scan(&m.ID, &m.URL, &m.Filename, &m.Mime, &m.Size, &m.CreatedAt); err == nil {
			media = append(media, gin.H{
				"id":         m.ID,
				"url":        m.URL,
				"filename":   m.Filename,
				"mime":       m.Mime,
				"size":       m.Size,
				"created_at": m.CreatedAt,
			})
		}
	}
	c.JSON(200, media)
}

func AdminCMSListLeads(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, email, source, status, created_at FROM cms_leads ORDER BY created_at DESC")
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var leads []gin.H
	for rows.Next() {
		var l struct {
			ID        string    `json:"id"`
			Email     string    `json:"email"`
			Source    string    `json:"source"`
			Status    string    `json:"status"`
			CreatedAt time.Time `json:"created_at"`
		}
		if err := rows.Scan(&l.ID, &l.Email, &l.Source, &l.Status, &l.CreatedAt); err == nil {
			leads = append(leads, gin.H{
				"id":         l.ID,
				"email":      l.Email,
				"source":     l.Source,
				"status":     l.Status,
				"created_at": l.CreatedAt,
			})
		}
	}
	c.JSON(200, leads)
}

func AdminCMSListContactMessages(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, name, email, subject, message, status, created_at FROM cms_contact_messages ORDER BY created_at DESC")
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var msgs []gin.H
	for rows.Next() {
		var m struct {
			ID        string    `json:"id"`
			Name      string    `json:"name"`
			Email     string    `json:"email"`
			Subject   string    `json:"subject"`
			Message   string    `json:"message"`
			Status    string    `json:"status"`
			CreatedAt time.Time `json:"created_at"`
		}
		if err := rows.Scan(&m.ID, &m.Name, &m.Email, &m.Subject, &m.Message, &m.Status, &m.CreatedAt); err == nil {
			msgs = append(msgs, gin.H{
				"id":         m.ID,
				"name":       m.Name,
				"email":      m.Email,
				"subject":    m.Subject,
				"message":    m.Message,
				"status":     m.Status,
				"created_at": m.CreatedAt,
			})
		}
	}
	c.JSON(200, msgs)
}
