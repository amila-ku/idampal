package articles

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
	Articles []Article `json:"articles"`
}

var art = ArticleList{}
// var (
// 	articles = map[int]*Article{}
// 	seq   = 1
// )

//----------
// Handlers
//----------

func createArticle(c echo.Context) error {
	defer c.Request().Body.Close()

	u := Article{
		ID: uuid.New(),
	}
	if err := c.Bind(u); err != nil {
		return err
	}

    art.Articles = append(art.Articles, u)
	return c.JSON(http.StatusCreated, u)
}

func getArticle(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	return c.JSON(http.StatusOK, art.Articles[id])
}

func getAllArticles(c echo.Context) error {
	s := NewSearch("8ec886c4db984880889d4a9d8b79b942", "bitcoin")
	res, err := s.GetNewsArticles()
	if err != nil {
		panic(err)
	}
	//art.Articles = res.Results.Articles

	return c.JSON(http.StatusOK, res.Results.Articles)
}

func updateArticle(c echo.Context) error {
	u := new(Article)
	if err := c.Bind(u); err != nil {
		return err
	}
	id, _ := strconv.Atoi(c.Param("id"))
	art.Articles[id].Title = u.Title
	return c.JSON(http.StatusOK, art.Articles[id])
}

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