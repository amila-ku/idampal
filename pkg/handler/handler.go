package handler

import (
	"github.com:amila-ku/newspal/pkg/news"
	"github.com/labstack/gommon/log"
)

// func CreateArticle(c echo.Context) error {
// 	defer c.Request().Body.Close()

// 	u := Article{
// 		ID: uuid.New(),
// 	}
// 	if err := c.Bind(u); err != nil {
// 		return err
// 	}

//     art.Articles = append(art.Articles, u)
// 	return c.JSON(http.StatusCreated, u)
// }

func mapArticleListAndSearch(art *ArticleList, s *Search) {
	res, err := s.GetNewsArticles()
	if err != nil {
		log.Error("Failed to fetch articles")
	}
	art.Articles = res.Results.Articles
	art.Category = s.SearchKey
}

// func GetArticle(c echo.Context) error {
// 	id, _ := strconv.Atoi(c.Param("id"))
// 	return c.JSON(http.StatusOK, art.Articles[id])
// }

// GetAllArticles returns l
func GetAllArticles(c echo.Context) error {
	s := NewSearch("8ec886c4db984880889d4a9d8b79b942", "bitcoin")
	a := ArticleList{}

	mapArticleListAndSearch(a, s)
	//art.Articles = res.Results.Articles

	return c.JSON(http.StatusOK, a.Articles)
}

// func UpdateArticle(c echo.Context) error {
// 	u := new(Article)
// 	if err := c.Bind(u); err != nil {
// 		return err
// 	}
// 	id, _ := strconv.Atoi(c.Param("id"))
// 	art.Articles[id].Title = u.Title
// 	return c.JSON(http.StatusOK, art.Articles[id])
// }

// func deleteArticle(c echo.Context) error {
// 	id, _ := strconv.Atoi(c.Param("id"))
// 	delete(art.Articles, id)
	
// 	//loop through all our items
// 	for index, item := range ItemList {
// 		// delete if item id matches
// 		if item.ID == id {
// 			ItemList = append(ItemList[:index], ItemList[index+1:]...)
// 		}
// 	}
// 	return c.NoContent(http.StatusNoContent)
// }