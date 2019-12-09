package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo"
	"github.com/google/uuid"
)

// Source defines the structure of news source
type Source struct {
	ID   interface{} `json:"id"`
	Name string      `json:"name"`
}
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

// ArticleList contains multiple list of articles
type ArticleList struct {
	Articles []Article
}


// var (
// 	articles = map[int]*Article{}
// 	seq   = 1
// )

//----------
// Handlers
//----------

func createArticle(c echo.Context) error {
	defer c.Request().Body.Close()

	u := &Article{
		ID: seq,
	}
	if err := c.Bind(u); err != nil {
		return err
	}
	articles[u.ID] = u
	seq++
	return c.JSON(http.StatusCreated, u)
}

func getArticle(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	return c.JSON(http.StatusOK, articles[id])
}

func getAllArticles(c echo.Context) error {
	return c.JSON(http.StatusOK, articles)
}

func updateArticle(c echo.Context) error {
	u := new(Article)
	if err := c.Bind(u); err != nil {
		return err
	}
	id, _ := strconv.Atoi(c.Param("id"))
	articles[id].Title = u.Title
	return c.JSON(http.StatusOK, articles[id])
}

func deleteArticle(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	delete(articles, id)
	return c.NoContent(http.StatusNoContent)
}