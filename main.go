package main

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type property struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
		Seller string `json:"seller"`
		Location string `json:"location"`
		Url 	string `json: "url"`
}


var (
	properties = map[int]*property{}
	seq   = 1
)

//----------
// Handlers
//----------

func createProperty(c echo.Context) error {
	defer c.Request().Body.Close()

	u := &property{
		ID: seq,
	}
	if err := c.Bind(u); err != nil {
		return err
	}
	properties[u.ID] = u
	seq++
	return c.JSON(http.StatusCreated, u)
}

func getProperty(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	return c.JSON(http.StatusOK, properties[id])
}

func getAllProperty(c echo.Context) error {
	return c.JSON(http.StatusOK, properties)
}

func updateProperty(c echo.Context) error {
	u := new(property)
	if err := c.Bind(u); err != nil {
		return err
	}
	id, _ := strconv.Atoi(c.Param("id"))
	properties[id].Name = u.Name
	return c.JSON(http.StatusOK, properties[id])
}

func deleteProperty(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	delete(properties, id)
	return c.NoContent(http.StatusNoContent)
}

func main() {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	e.POST("/property", createProperty)
	e.GET("/property", getAllProperty)
	e.GET("/property/:id", getProperty)
	e.PUT("/property/:id", updateProperty)
	e.DELETE("/property/:id", deleteProperty)

	// Start server
	e.Logger.Fatal(e.Start(":1323"))
}