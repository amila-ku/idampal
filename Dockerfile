FROM golang:1.14

WORKDIR /go/src/app
COPY newspal .

CMD ["/go/src/app/newspal"]