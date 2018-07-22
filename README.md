
JSON Body to POST to Python endpoint
```
{
    "size": 10,
    "start": "(0,0"
    "end": "(9,9)",
    "obstacles": ["(4,4)", "(4,5)"]
    "algorithm": "dijkstra"
}
```

# Running the application locally
1. Clone repo and then naviagate to root of the project
1. Using Python 2.7, run `python -m SimpleHTTPServer`
1. Access the site at `localhost:8000`