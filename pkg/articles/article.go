package articles

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo"
	"github.com/google/uuid"
)


// Article defines the news article structure
type Article struct {
	ID   uuid.UUID    `json:"id"`
	Source      Source    `json:"source"`
	Author      string    `json:"author"`
	Title       string    `json:"title"`
	URL         string    `json:"url"`
	URLToImage  string    `json:"urlToImage"`
	PublishedAt time.Time `json:"publishedAt"`
	Content     string    `json:"content"`
	Location	string	  `json:"location"`
}

// Source defines the structure of news source
type Source struct {
	ID   interface{} `json:"id"`
	Name string      `json:"name"`
}


