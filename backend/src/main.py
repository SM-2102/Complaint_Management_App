from fastapi import FastAPI
from fastapi.responses import FileResponse

from auth.routes import auth_router
from employee.routes import employee_router
from exceptions import register_exceptions
from menu.routes import menu_router
from middleware.middleware import register_middleware
from notification.routes import notification_router
from stock_cgcel.routes import stock_cgcel_router
from stock_cgpisl.routes import stock_cgpisl_router

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
app.include_router(employee_router, prefix="/employee", tags=["Employee"])
app.include_router(menu_router, prefix="/menu", tags=["Menu"])
app.include_router(notification_router, prefix="/notification", tags=["Notification"])
app.include_router(stock_cgcel_router, prefix="/stock_cgcel", tags=["Stock CGCEL"])
app.include_router(stock_cgpisl_router, prefix="/stock_cgpisl", tags=["Stock CGPISL"])
