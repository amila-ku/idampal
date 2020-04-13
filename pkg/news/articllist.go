package news

import (
	"strconv"
	 "github.com/labstack/gommon/log"
)

// ArticleList contains multiple list of articles
type ArticleList struct {
	Name string        `json:"name"`
	Category string    `json:"category"`
	Articles []Article `json:"articles"`
}

// NewArticleList creates a ArticleList
func NewArticleList(name, category string, articles []Article) *ArticleList {
	log.Debug("Create New Article List Succesfully")
	return & ArticleList {
		Name: name,
		Category: category,
		Articles: articles,
	}
}

func (a *ArticleList) getArticles() []Article {
	return a.Articles
}

func (a *ArticleList) getArticle(id string) Article {
	artid, _ := strconv.Atoi(id)
	article := a.Articles[artid]

	return article
}


