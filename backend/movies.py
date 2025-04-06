from pydantic import BaseModel
from typing import List

class Movie(BaseModel):
    movieIid : int
    title: str
    director:str
    releaseDate: str
    rating: float
    description: str
    poster: str

movies: List[Movie] = [
    Movie(
        movieIid=1,
        title='Interstellar',
        director='Christopher Nolan',
        releaseDate='2014-11-07',
        rating=8.6,
        description="A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        poster='https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    ),

    Movie(
        movieIid=2,
        title='Inception',
        director='Christopher Nolan',
        releaseDate='2010-07-16',
        rating=9.3,
        description='A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        poster='https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    ),

    Movie(
        movieIid=3,
        title='The Shawshank Redemption',
        director='Frank Darabont',
        releaseDate='1994-09-23',
        rating=9.3,
        description='Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        poster='https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    ),
    
    Movie(
        movieIid=4,
        title='The Godfather',
        director='Francis Ford Coppola',
        releaseDate='1972-03-24',
        rating=9.2,
        description='The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        poster='https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    ),
    
    Movie(
        movieIid=5,
        title='Pulp Fiction',
        director='Quentin Tarantino',
        releaseDate='1994-10-14',
        rating=8.9,
        description='The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        poster='https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    ),
    
    Movie(
        movieIid=6,
        title='The Dark Knight',
        director='Christopher Nolan',
        releaseDate='2008-07-18',
        rating=9.0,
        description='When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        poster='https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
    ),
    
    Movie(
        movieIid=7,
        title='Fight Club',
        director='David Fincher',
        releaseDate='1999-10-15',
        rating=8.8,
        description='An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
        poster='https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    ),
    
    Movie(
        movieIid=8,
        title='The Matrix',
        director='Lana and Lilly Wachowski',
        releaseDate='1999-03-31',
        rating=8.7,
        description='A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
        poster='https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
    ),
    
    Movie(
        movieIid=9,
        title='Goodfellas',
        director='Martin Scorsese',
        releaseDate='1990-09-19',
        rating=8.7,
        description='The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
        poster='https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    ),
    
    Movie(
        movieIid=10,
        title='Parasite',
        director='Bong Joon Ho',
        releaseDate='2019-10-11',
        rating=8.6,
        description='Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        poster='https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg',
    ),
    
    Movie(
        movieIid=11,
        title='The Lord of the Rings: The Fellowship of the Ring',
        director='Peter Jackson',
        releaseDate='2001-12-19',
        rating=8.8,
        description='A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
        poster='https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg',
    ),
    
    Movie(
        movieIid=12,
        title='Forrest Gump',
        director='Robert Zemeckis',
        releaseDate='1994-07-06',
        rating=8.8,
        description='The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
        poster='https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg',
    )
]