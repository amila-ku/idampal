package main

import (
	"fmt"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com:amila-ku/newspal/pkg"
)



func main() {

	newsapikey := "8ec886c4db984880889d4a9d8b79b942"
	searchqyery := "top-headlines"

	s := NewSearch(newsapikey,searchqyery)

	s.GetNewsArticles()

	fmt.Println(s.Results)

	fmt.Println("starting")


	
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	e.POST("/article", createArticle)
	e.GET("/allarticles", getAllArticles)
	e.GET("/article/:id", getArticle)
	e.PUT("/article/:id", updateArticle)
	//e.DELETE("/article/:id", deleteArticle)

	// Static
	//e.Static("/assets", "assets")

	// Start server
	e.Logger.Fatal(e.Start(":1323"))

}