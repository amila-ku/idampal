package main

import (
	"fmt"
	"github.com/gocolly/colly"
)


type property struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Seller string `json:"seller"`
	Location string `json:"location"`
	Url 	string `json: "url"`
}

func main() {
	c := colly.NewCollector()

	// Find and visit all links
	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		e.Request.Visit(e.Attr("href"))
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	c.Visit("https://ikman.lk/en/")

	// Create another collector to scrape course details
	//detailCollector := c.Clone()

	// On every a HTML element which has name attribute call callback
	c.OnHTML(`a[name]`, func(e *colly.HTMLElement) {
		// Activate detailCollector if the link contains "coursera.org/learn"
		propURL := e.Request.AbsoluteURL(e.Attr("href"))
		fmt.Println(propURL)

	})
}