package main


//type articles	[]Article

// NewsAPIResponce defines responce structure from news api 
type NewsAPIResponce struct {
	Status       string    `json:"status"`
	TotalResults int       `json:"totalResults"`
	NewsArticles []Article  `json: "articles"`	
}

// GetNewsArticles gets news
func (a NewsAPIResponce) GetNewsArticles () []Article {
	art := []Article{}

	search.NextPage = next
	pageSize := 20

	endpoint := fmt.Sprintf("https://newsapi.org/v2/everything?q=%s&pageSize=%d&page=%d&apiKey=%s&sortBy=publishedAt&language=en", url.QueryEscape(search.SearchKey), pageSize, search.NextPage, *apiKey)
	resp, err := http.Get(endpoint)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	return art
}