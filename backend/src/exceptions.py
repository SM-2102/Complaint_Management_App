from typing import Any, Callable

from fastapi import FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse


class BaseException(Exception):
    """This is the base class for all Errors"""


class IncorrectCodeFormat(BaseException):
    """Incorrect Code Format"""


class EmployeeAlreadyExists(BaseException):
    """Employee Already Exists"""


class InvalidCredentials(BaseException):
    """Invalid Credentials"""


class CannotDeleteCurrentUser(BaseException):
    """Cannot delete the currently logged in user"""


class AccessTokenRequired(BaseException):
    """Please provide an Access Token"""


class RefreshTokenRequired(BaseException):
    """Please provide a Refresh Token"""


class InvalidToken(BaseException):
    """Invalid Token"""


class AccessDenied(BaseException):
    """Access Denied due to insufficient permissions"""


class UserNotFound(BaseException):
    """User Not Found"""


class EmployeeNotFound(BaseException):
    """Employee Not Found"""


class IncorrectCodeFormat(BaseException):
    """Incorrect Code Format"""


class SpareNotFound(BaseException):
    """Spare Not Found"""


class StockNotAvailable(BaseException):
    """Stock Not Available"""

class CustomerAlreadyExists(BaseException):
    """Customer Already Exists"""

class CustomerNotFound(BaseException):
    """Customer Not Found"""

class CannotChangeCustomerName(BaseException):
    """Cannot change the customer name"""

class ComplaintNumberAlreadyExists(BaseException):
    """Complaint Number Already Exists"""

class ComplaintNotFound(BaseException):
    """Complaint Not Found"""

class ComplaintNumberGenerationFailed(BaseException):
    """Failed to generate a unique complaint number after retries"""

class UpdateFailed(BaseException):
    """Failed to update the complaint"""

def create_exception_handler(
    status_code: int, initial_detail: Any
) -> Callable[[Request, Exception], JSONResponse]:
    async def exception_handler(request: Request, exc: BaseException):
        return JSONResponse(content=initial_detail, status_code=status_code)

    return exception_handler


def register_exceptions(app: FastAPI):

    app.add_exception_handler(
        EmployeeAlreadyExists,
        create_exception_handler(
            status_code=status.HTTP_409_CONFLICT,
            initial_detail={
                "message": "Employee Already Exists",
                "resolution": "Please choose a different name",
                "error_code": "user_already_exists",
            },
        ),
    )

    app.add_exception_handler(
        InvalidCredentials,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "Invalid Credentials",
                "resolution": "Please check your password",
                "error_code": "invalid_credentials",
            },
        ),
    )

    app.add_exception_handler(
        CannotDeleteCurrentUser,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Cannot Delete The Logged In User",
                "resolution": "Please log in as a different user",
                "error_code": "cannot_delete_current_user",
            },
        ),
    )

    app.add_exception_handler(
        AccessTokenRequired,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "Please provide a valid access token",
                "resolution": "Please get an access token",
                "error_code": "access_token_required",
            },
        ),
    )

    app.add_exception_handler(
        RefreshTokenRequired,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message": "Please provide a valid refresh token",
                "resolution": "Please get an refresh token",
                "error_code": "refresh_token_required",
            },
        ),
    )

    app.add_exception_handler(
        InvalidToken,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "The provided token is invalid",
                "resolution": "Please provide a valid token",
                "error_code": "invalid_token",
            },
        ),
    )

    app.add_exception_handler(
        AccessDenied,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message": "Access Denied due to Insufficient Permissions",
                "resolution": "Only admin users can access this resource",
                "error_code": "access_denied",
            },
        ),
    )

    app.add_exception_handler(
        UserNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "User Not Found",
                "resolution": "Please check the username",
                "error_code": "user_not_found",
            },
        ),
    )

    app.add_exception_handler(
        EmployeeNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Employee Not Found",
                "resolution": "Please check the username",
                "error_code": "employee_not_found",
            },
        ),
    )

    app.add_exception_handler(
        IncorrectCodeFormat,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Incorrect Code Format",
                "resolution": "Please provide code in correct format",
                "error_code": "incorrect_code_format",
            },
        ),
    )

    app.add_exception_handler(
        SpareNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Spare Not Found",
                "resolution": "Check the spare code or name",
                "error_code": "spare_not_found",
            },
        ),
    )

    app.add_exception_handler(
        StockNotAvailable,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Stock Not Available",
                "resolution": "Insufficient stock for the spare",
                "error_code": "stock_not_available",
            },
        ),
    )

    app.add_exception_handler(
        CustomerAlreadyExists,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Customer Already Exists",
                "resolution": "Please use a different customer name",
                "error_code": "customer_already_exists",
            },
        ),
    )

    app.add_exception_handler(
        CustomerNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Customer Not Found",
                "resolution": "Please check the customer code or name",
                "error_code": "customer_not_found",
            },
        ),
    )

    app.add_exception_handler(
        CannotChangeCustomerName,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Cannot change the customer name",
                "resolution": "Customer name is immutable once created",
                "error_code": "cannot_change_customer_name",
            },
        ),
    )

    app.add_exception_handler(
        ComplaintNumberAlreadyExists,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Complaint Number Already Exists",
                "resolution": "Please use a different complaint number",
                "error_code": "complaint_number_already_exists",
            },
        ),
    )

    app.add_exception_handler(
        ComplaintNumberGenerationFailed,
        create_exception_handler(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            initial_detail={
                "message": "Unable to generate complaint number",
                "resolution": "Please retry the request or contact support",
                "error_code": "complaint_number_generation_failed",
            },
        ),
    )

    app.add_exception_handler(
        ComplaintNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Complaint Not Found",
                "resolution": "Please check the complaint number",
                "error_code": "complaint_not_found",
            },
        ),
    )

    app.add_exception_handler(
        UpdateFailed,
        create_exception_handler(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            initial_detail={
                "message": "Failed to update",
                "resolution": "Please retry the request or contact support",
                "error_code": "update_failed",
            },
        ),
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        # Customize the error message here
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "message": "Validation error!",
                "resolution": "Please check the data provided for correctness",
                "error_code": "validation_error",
            },
        )
    


    # @app.exception_handler(500)
    # async def internal_server_error(request, exc):
    #     return JSONResponse(
    #         content={
    #             "message": "Oops! Something went wrong",
    #             "error_code": "server_error",
    #         },
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #     )

    # @app.exception_handler(SQLAlchemyError)
    # async def database__error(request, exc):
    #     print(str(exc))
    #     return JSONResponse(
    #         content={
    #             "message": "Oops! Something went wrong",
    #             "error_code": "server_error",
    #         },
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #     )
