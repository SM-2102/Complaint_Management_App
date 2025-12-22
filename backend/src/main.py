from fastapi import FastAPI
from fastapi.responses import FileResponse

from auth.routes import auth_router
from exceptions import register_exceptions
from middleware.middleware import register_middleware
from user.routes import user_router

version = "v1"

app = FastAPI(
    version=version,
    title="Complaint Management",
    description="Complaint Management System",
    license_info={"name": "MIT License", "url": "https://opensource.org/license/mit"},
    contact={
        "name": "Sukanya Manna",
        "url": "https://github.com/SM-2102",
        "email": "sukanya.manna.2002@gmail.com",
    },
    openapi_url=f"/openapi.json",
    docs_url=f"/docs",
    redoc_url=f"/redoc",
)


@app.get("/")
def read_root():
    return {
        "title": "Complaint Management",
        "description": "Complaint Management System",
        "version": version,
        "contact": {
            "name": "Sukanya Manna",
            "url": "https://github.com/SM-2102",
            "email": "sukanya.manna.2002@gmail.com",
        },
        "license": {"name": "MIT License", "url": "https://opensource.org/license/mit"},
        "message": "Welcome to Smart Enterprise Management System",
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("favicon.ico")


# Register middleware
register_middleware(app)

# Register exception handlers
register_exceptions(app)

# Routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(user_router, prefix="/user", tags=["User"])