package content
import (
	//"fmt"
	"os"
	"log"
	"github.com/ChimeraCoder/anaconda"
)

var (
	csKey       = os.Getenv("CONSUMER_KEY")
	csSecret    = os.Getenv("CONSUMER_SECRET")
	acToken       = os.Getenv("ACCESS_TOKEN")
	acTokenSecret = os.Getenv("ACCESS_TOKEN_SECRET")
)

// TwitterSearch defines the information required for doing a search in twitter using api
type TwitterSearch struct {
	SearchKey string
	consumerKey string
	consumerSecret string
	accessToken string
	accessTokenSecret string
	PageSize int
}

// TwitterResponce holds responce structure from news api 	
type TwitterNewsArticle struct {
	Id			int64                  `json:"id"`
	User        string                 `json:"user"`
	CreatedAt   string                 `json:"created_at"`
	// FullText    string                 `json:"full_text"`
	Text        string                 `json:"text"`
}

// NewTwitterSearch initializes content for TwitterSearch
func NewTwitterSearch(search string) TwitterSearch {
	return TwitterSearch {
		SearchKey: search,
		consumerKey: csKey,
		consumerSecret: csSecret,
		accessToken: acToken,
		accessTokenSecret: acTokenSecret,
		PageSize: 15,
	}
}

// TwitterNews returns list of statusus for a topic
func (t TwitterSearch)TwitterNews(searchKey string) ([]TwitterNewsArticle, error) {
	anaconda.SetConsumerKey(t.consumerKey)
	anaconda.SetConsumerSecret(t.consumerSecret)
	api := anaconda.NewTwitterApi(t.accessToken, t.accessTokenSecret)

	res, err := api.GetSearch(searchKey, nil)
	if err != nil {
		log.Fatalln("unable to reach url")
	}

	tlist := []TwitterNewsArticle{}

	for _, tweet := range res.Statuses {
		tw := TwitterNewsArticle{
			Id: tweet.Id,
			User: tweet.User.Name,
			CreatedAt: tweet.CreatedAt,
			Text: tweet.Text,
		}
		tlist = append(tlist,tw)
	}

	return tlist, nil
}
