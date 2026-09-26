from users import create_account

def main():
    name = "Andrew"
    username = "justanothaguy"
    email = "andrew@sanicsquirtle.com"
    password = "abc123"

    create_account(name, username, email, password)

if __name__ == "__main__":
    main()