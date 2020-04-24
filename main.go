package main

import (
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/amila-ku/newspal/pkg/service"
)



func main() {

	
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	// e.POST("/article", createArticle)
	e.GET("/allarticles", service.GetAllArticles)
	// e.GET("/article/:id", getArticle)
	// e.PUT("/article/:id", updateArticle)
	//e.DELETE("/article/:id", deleteArticle)

	// Static
	//e.Static("/assets", "assets")

	// Start server
	e.Logger.Fatal(e.Start(":1323"))

}