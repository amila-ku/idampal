package reporter

import (
	//"io/ioutil"
	"log"
	"fmt"
	"net/url"
	"net/http"
	"encoding/json"
	"math"
	//"io"
	"time"
	//"os"
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

// // NewsAPIResponce defines responce structure from news api 
// type NewsAPIResponce struct {
// 	Status       string    `json:"status"`
// 	TotalResults int       `json:"totalResults"`
// 	NewsArticles ArticleList  `json: "articles"`	
// }

// NewsAPIResponce holds responce structure from news api 	
type NewsAPIResponce struct {
	Status       string `json:"status"`
	TotalResults int    `json:"totalResults"`
	Articles     []struct {
		Source struct {
			ID   interface{} `json:"id"`
			Name string      `json:"name"`
		} `json:"source"`
		Author      string    `json:"author"`
		Title       string    `json:"title"`
		Description string    `json:"description"`
		URL         string    `json:"url"`
		URLToImage  string    `json:"urlToImage"`
		PublishedAt time.Time `json:"publishedAt"`
		Content     string    `json:"content"`
	} `json:"articles"`
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
func (s Search) GetNewsArticles() (Search, error) {

	endpoint := fmt.Sprintf("https://newsapi.org/v2/everything?q=%s&pageSize=%d&page=%d&apiKey=%s&sortBy=publishedAt&language=en", url.QueryEscape(s.SearchKey), s.PageSize, s.NextPage, s.ApiKey)
	//fmt.Println(endpoint)
	resp, err := http.Get(endpoint)

	//fmt.Println(resp)
	if err != nil {
		log.Fatalln("unable to reach url")
	}

	// io.Copy(os.Stdout, resp.Body)

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Fatalln("not succesfull")
	}

	// body, err := ioutil.ReadAll(resp.Body)

	
	
	// fmt.Println(body)
	
	// err = json.Unmarshal(body,&s.Results)

	body := json.NewDecoder(resp.Body).Decode(&s.Results)

	fmt.Println(body)

	if err != nil {
		log.Fatalln("unable to reach url")
	}

	fmt.Println(s.Results)

	if err != nil {
		log.Fatalln("parsing failed")
	}

	s.TotalPages = int(math.Ceil(float64(s.Results.TotalResults / s.PageSize)))
	
	return s, err
}