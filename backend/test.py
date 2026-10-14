from users import create_account

def main():
    name = "Diego"
    username = "raccoon"
    email = "druiz@gmail.com"
    password = "abc123"

    create_account(name, username, email, password)

if __name__ == "__main__":
    main()