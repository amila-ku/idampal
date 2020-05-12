package main

import (
	"os"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/amila-ku/newspal/pkg/service"
)



func main() {
	
	e := echo.New()

	var newsapitoken  = os.Getenv("NEWS_API_TOKEN")
	if newsapitoken == "" {
		e.Logger.Fatal("cannot find newsapi token")
	}

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://newsapi.local:5000", "http://localhost:8081", "http://localhost:5000"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	s := service.NewHandler(newsapitoken)
	

	// Routes
	e.GET("/news/headlines", s.MainNews)
	e.GET("/news/business", s.BusinessNews)
	e.GET("/news/technology", s.TechNews)
	e.GET("/news/twitter", s.TwitterNews)
	e.GET("/news/twitter/business", s.TwitterNewsBusiness)
	e.GET("/news/twitter/technology", s.TwitterNewsTechnology)


	// // Static
	// e.Static("/assets", "templates")

	// // html
	// e.File("/", "templates/index.html")

	// Start server
	e.Logger.Fatal(e.Start(":1323"))

}