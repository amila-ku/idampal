package handler

import (
	"net/http"
	news "github.com/amila-ku/newspal/pkg/content"
	"github.com/labstack/gommon/log"
	"github.com/labstack/echo"
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

// func mapArticleListAndSearch(art *c.ArticleList, s *c.Search) {
// 	res, err := c.GetNewsArticles()
// 	if err != nil {
// 		log.Error("Failed to fetch articles")
// 	}
// 	art.Articles = res.Results.Articles
// 	art.Category = s.SearchKey
// }

// func GetArticle(c echo.Context) error {
// 	id, _ := strconv.Atoi(c.Param("id"))
// 	return c.JSON(http.StatusOK, art.Articles[id])
// }

// GetAllArticles returns l
func GetAllArticles(c echo.Context) error {
	s := news.NewSearch("8ec886c4db984880889d4a9d8b79b942", "bitcoin")

	res, err := s.GetNewsArticles()
	if err != nil {
		log.Error("Failed to fetch articles")
	}

	n := news.NewArticleList("coinnews", "crypto", res)

	//art.Articles = res.Results.Articles

	return c.JSON(http.StatusOK, n)
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