from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

from movies import movies, Movie

app = FastAPI()

@app.get("/movies", response_model=List[Movie])
def get_movies():
    return movies

@app.get("/movies/byid/{movie_id}", response_model=Movie)
def get_movie(movie_id):
    for m in movies:
        if m.movieIid == movie_id:
            return m
    raise HTTPException(status_code=404, detail="Movie not found (GET)")

@app.post("/movies", response_model=Movie, status_code=201)
def create_movie(movie: Movie):
    movies.append(movie)
    return movie

@app.put("movies/{movie_id}",response_model=Movie)
def update_movie(movie_id: int, updated_movie: Movie):
    for index, movie in enumerate(movies):
        if movie.movieIid == movie_id:
            movies[index] = updated_movie
            return updated_movie
    raise HTTPException(status_code=404, detail="Movie title not found (PUT)")

@app.delete("/movies/{movie_title}", status_code=204)
def delete_todo(movie_id: int):
    for index, movie in enumerate(movies):
        if movie.movieIid == movie_id:
            movies.pop(index)
            return
    raise HTTPException(status_code=404, detail="Movie not found (DELETE)")

@app.get("/movies/bystr/{partial_title_or_director}", response_model=List[Movie])
def get_movies_filtered(partial_title_or_director: str):
    res = []
    for m in movies:
        if partial_title_or_director.lower() in m.title.lower() or partial_title_or_director.lower() in m.director.lower():
            res.append(m)
    return res

@app.get("/movies/sorted/bytitleasc")
def get_movies_sorted_by_title_asc():
    return sorted(movies, key=lambda movie: movie.title)

@app.get("/movies/sorted/bytitledesc", response_model=List[Movie])
def get_movies_sorted_by_title_desc():
    return sorted(movies, key=lambda movie: movie.title, reverse=True)

@app.get("/movies/sorted/byratingasc")
def get_movies_sorted_by_title_asc():
    return sorted(movies, key=lambda movie: movie.rating)

@app.get("/movies/sorted/byratingdesc", response_model=List[Movie])
def get_movies_sorted_by_title_desc():
    return sorted(movies, key=lambda movie: movie.rating, reverse=True)