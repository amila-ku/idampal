package service

import (
	"net/http"
	news "github.com/amila-ku/newspal/pkg/content"
	"github.com/labstack/gommon/log"
	"github.com/labstack/echo"
)

// var newsapitoken  = os.Getenv("NEWS_API_TOKEN")

// Handler contains new endpoint content
type Handler struct {
	search news.Search
	twitterSearch news.TwitterSearch
}

// NewHandler returns responce handlers
func NewHandler(newsapitoken string) Handler {
	return Handler {
		search: news.NewSearch(newsapitoken, "business"),
		twitterSearch: news.NewTwitterSearch("#business"),
	}

}


// MainNews returns articles for main page
func (s Handler) MainNews(c echo.Context) error {
	// s := news.NewSearch(newsapitoken, "business")

	res, err := s.search.NewsHeadlines()
	if err != nil {
		log.Error("Failed to fetch articles")
	}

	return c.JSON(http.StatusOK, res)
}

// BusinessNews returns l
func (s Handler)BusinessNews(c echo.Context) error {

	res, err := s.search.NewsArticles("business")
	if err != nil {
		log.Error("Failed to fetch articles")
	}

	return c.JSON(http.StatusOK, res)
}

// TechNews returns l
func (s Handler)TechNews(c echo.Context) error {

	res, err := s.search.NewsArticles("technology")
	if err != nil {
		log.Error("Failed to fetch articles")
	}

	return c.JSON(http.StatusOK, res)
}

// TwitterNews returns list of general tweets
func (s Handler)TwitterNews(c echo.Context) error {

	res, err := s.twitterSearch.TwitterNews("#USA")
	if err != nil {
		log.Error("Failed to fetch articles")
	}

	return c.JSON(http.StatusOK, res)
}

// TwitterNewsBusiness returns list of post related to business 
func (s Handler)TwitterNewsBusiness(c echo.Context) error {

	res, err := s.twitterSearch.TwitterNews("#Business")
	if err != nil {
		log.Error("Failed to fetch articles")
	}

	return c.JSON(http.StatusOK, res)
}

// TwitterNewsTechnology returns list of post related to technology
func (s Handler)TwitterNewsTechnology(c echo.Context) error {

	res, err := s.twitterSearch.TwitterNews("#Technology")
	if err != nil {
		log.Error("Failed to fetch articles")
	}

	return c.JSON(http.StatusOK, res)
}