# Discord Bot - Channel Lock/Unlock with Role Permission Management

This Discord bot allows server administrators to lock and unlock channels, updating role permissions to manage send message capabilities. The bot uses Discord.js and reads environment variables from a `.env` file.

## Features

- Lock and unlock channels with a command.
- Automatically update role permissions to deny or allow sending messages when channels are locked or unlocked.
- Manage command permissions using specified role IDs.
- Cooldown period for lock and unlock commands to prevent spam.

## Prerequisites

- Node.js
- npm
- Discord Bot Token
- Role IDs for allowed users and managed role

## Installation

1. **Clone the repository:**

    ```bash
    git clone [https://github.com/Poke-Legend/SysBots-Channel-Control.git]
    cd SysBots-Channel-Control
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Create a `.env` file:**

    Create a `.env` file in the root directory of your project and add the following variables:

    ```env
    BOT_TOKEN=your-bot-token-here

    ALLOWED_ROLE_ID=role-id-1
    ALLOWED_ROLE_ID2=role-id-2
    ALLOWED_ROLE_ID3=role-id-3

    ROLE_TO_MANAGE_ID=role-to-manage-id
    ```

    - `your-bot-token-here`: The bot token from the Discord Developer Portal.
    - `role-id-1`, `role-id-2`, `role-id-3`: The IDs of roles allowed to use the lock/unlock commands.
    - `role-to-manage-id`: The ID of the role that will have its send messages permission managed.

## Usage

1. **Start the bot:**

    ```bash
    node index.js
    ```

2. **Commands:**

    - `!lock`: Locks the current channel, updates the channel name with a lock emoji, and denies the send messages permission for the specified role.
    - `!unlock`: Unlocks the current channel, updates the channel name with an unlock emoji, and restores the send messages permission for the specified role.

## Code Explanation

The bot uses the following main functions and handlers:

- **Reading and writing JSON data:**
    - `readRememberFile()`: Reads the `remember.json` file to keep track of channel lock states and cooldowns.
    - `writeRememberFile(data)`: Writes data to the `remember.json` file.

- **Cooldown management:**
    - `canExecuteCommand(lastExecuted, duration)`: Checks if the cooldown period has expired for a command.
    - `formatRemainingTime(ms)`: Formats the remaining cooldown time into a readable string.

- **Event Handlers:**
    - `client.on('ready', () => {...})`: Logs a message when the bot is ready.
    - `client.on('messageCreate', async message => {...})`: Handles incoming messages and processes commands.

- **Command Processing:**
    - Checks if the bot and user have necessary permissions.
    - Verifies if the user has one of the allowed roles.
    - Executes the lock/unlock commands and updates channel permissions and names accordingly.
    - Sends embedded messages to provide feedback to the user.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Discord.js](https://discord.js.org/) - A powerful JavaScript library for interacting with the Discord API.
- [dotenv](https://github.com/motdotla/dotenv) - A zero-dependency module that loads environment variables from a .env file into `process.env`.
