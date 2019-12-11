package main

import (
	"io/ioutil"
	"log"
	"fmt"
	"net/url"
	"net/http"
	"encoding/json"
	"math"
	//"github.com/labstack/gommon/log"

)

// Search defines user search 
type Search struct {
	SearchKey  string
	ApiKey 	   string
	PageSize   int
	NextPage   int
	TotalPages int
	Results    NewsAPIResponce
}

// NewsAPIResponce defines responce structure from news api 
type NewsAPIResponce struct {
	Status       string    `json:"status"`
	TotalResults int       `json:"totalResults"`
	NewsArticles ArticleList  `json: "articles"`	
}

// NewSearch intiates a search
func NewSearch(apiKey string, sKey string) Search {
	search := Search{}

	search.SearchKey = sKey
	search.NextPage = 1
	search.PageSize = 2
	search.ApiKey = apiKey

	return search
}

// GetNewsArticles gets news from news api
func (s Search) GetNewsArticles () (Search, error) {

	endpoint := fmt.Sprintf("https://newsapi.org/v2/everything?q=%s&pageSize=%d&page=%d&apiKey=%s&sortBy=publishedAt&language=en", url.QueryEscape(s.SearchKey), s.PageSize, s.NextPage, s.ApiKey)
	//fmt.Println(endpoint)
	resp, err := http.Get(endpoint)

	//fmt.Println(resp)
	if err != nil {
		log.Fatalln("unable to reach url")
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Fatalln("not succesfull")
	}

	body, err := ioutil.ReadAll(resp.Body)
	
	//fmt.Println(body)
	
	err = json.Unmarshal(body,&s.Results)

	fmt.Println(s.Results)

	if err != nil {
		log.Fatalln("parsing failed")
	}

	s.TotalPages = int(math.Ceil(float64(s.Results.TotalResults / s.PageSize)))
	
	return s, err
}