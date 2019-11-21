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
	return art
}