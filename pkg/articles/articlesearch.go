package articles

import (
	 "github.com/labstack/gommon/log"
)

// ArticleList contains multiple list of articles
type ArticleList struct {
	Name string
	Category string
	Articles []Article `json:"articles"`
}

//var art = ArticleList{}
// var (
// 	articles = map[int]*Article{}
// 	seq   = 1
// )

//----------
// Handlers
//----------

func getArticles(apitoken string, category string) (ArticleList, error) {
	s := NewSearch(apitoken, category)
	res, err := s.GetNewsArticles()
	if err != nil {
		log.Error("Failed to fetch articles")
	}
	//art.Articles = res.Results.Articles

	return res.Results.Articles, nil
}

func ()getAllArticles(c echo.Context) error {
	s := NewSearch("8ec886c4db984880889d4a9d8b79b942", "bitcoin")
	res, err := s.GetNewsArticles()
	if err != nil {
		panic(err)
	}
	//art.Articles = res.Results.Articles

	return c.JSON(http.StatusOK, res.Results.Articles)
}