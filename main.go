package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type Source struct {
	ID   interface{} `json:"id"`
	Name string      `json:"name"`
}

type Article struct {
	ID   int    `json:"id"`
	Source      Source    `json:"source"`
	Author      string    `json:"author"`
	Title       string    `json:"title"`
	URL         string    `json:"url"`
	URLToImage  string    `json:"urlToImage"`
	PublishedAt time.Time `json:"publishedAt"`
	Content     string    `json:"content"`
	Location	string	  `json:"location"`
}


var (
	articles = map[int]*Article{}
	seq   = 1
)

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

func getAllArticle(c echo.Context) error {
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

func main() {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	e.POST("/article", createArticle)
	e.GET("/allarticles", getAllArticle)
	e.GET("/article/:id", getArticle)
	e.PUT("/article/:id", updateArticle)
	e.DELETE("/article/:id", deleteArticle)

	// Start server
	e.Logger.Fatal(e.Start(":1323"))
}