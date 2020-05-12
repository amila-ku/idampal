package content

import (
	"log"
	"fmt"
	"net/url"
	"net/http"
	"encoding/json"
	"math"
	"time"
	//"github.com/labstack/gommon/log"
	"github.com/google/uuid"

)

// Source defines the structure of news source
type Source struct {
	ID   interface{} `json:"id"`
	Name string      `json:"name"`
}

// NewsAPIArticle defines the news article structure
type NewsAPIArticle struct {
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

// New creates a new news article
func New(s Source, author, title string) NewsAPIArticle {
	return NewsAPIArticle {
		Source: s,
		Author: author,
		Title: title,
	}
}

func (a NewsAPIArticle) getTitle() string {
	return a.Title
}

// Search defines user search 
type Search struct {
	SearchKey  string
	ApiKey 	   string
	PageSize   int
	NextPage   int
	TotalPages int
	Results    NewsAPIResponce
}

// NewsAPIResponce holds responce structure from news api 	
type NewsAPIResponce struct {
	Status       string `json:"status"`
	TotalResults int    `json:"totalResults"`
	Articles     []NewsAPIArticle `json:"articles"`
}

// NewSearch intiates a search
func NewSearch(apiKey string, sKey string) Search {
	search := Search{}

	search.SearchKey = sKey
	search.NextPage = 2
	search.PageSize = 15
	search.ApiKey = apiKey

	return search
}

// NewsHeadlines gets news from news api
func (s Search) NewsHeadlines() ([]NewsAPIArticle, error) {

	endpoint := fmt.Sprintf("https://newsapi.org/v2/top-headlines?country=us&pageSize=%d&page=%d&apiKey=%s&sortBy=popularity&language=en", s.PageSize, s.NextPage, s.ApiKey)

	resp, err := http.Get(endpoint)

	if err != nil {
		log.Fatalln("unable to reach url")
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Fatalln("not succesfull")
	}

	body := json.NewDecoder(resp.Body).Decode(&s.Results)

	fmt.Println(body)

	if err != nil {
		log.Fatalln("unable to reach url")
	}

	if err != nil {
		log.Fatalln("parsing failed")
	}

	s.TotalPages = int(math.Ceil(float64(s.Results.TotalResults / s.PageSize)))
	
	return s.Results.Articles, err
}

// NewsArticles gets news from news api
func (s Search) NewsArticles(searchkey string) ([]NewsAPIArticle, error) {
	// if searchkey != "business" || searchkey != "technology" || searchkey != "general" || searchkey != "health" {
	// 	searchkey = s.SearchKey
	// }
	endpoint := fmt.Sprintf("https://newsapi.org/v2/top-headlines?country=us&category=%s&pageSize=%d&page=%d&apiKey=%s&sortBy=popularity&language=en", url.QueryEscape(searchkey), s.PageSize, s.NextPage, s.ApiKey)

	resp, err := http.Get(endpoint)

	if err != nil {
		log.Fatalln("unable to reach url")
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Fatalln("not succesfull")
	}

	body := json.NewDecoder(resp.Body).Decode(&s.Results)

	fmt.Println(body)

	if err != nil {
		log.Fatalln("unable to reach url")
	}



	if err != nil {
		log.Fatalln("parsing failed")
	}

	s.TotalPages = int(math.Ceil(float64(s.Results.TotalResults / s.PageSize)))
	
	return s.Results.Articles, err
}