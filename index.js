require('dotenv').config(); // Load environment variables from .env file
const fs = require('fs');
const { Client, Intents, MessageEmbed } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const prefix = '!'; // Your bot's command prefix
const allowedRoleIds = [
    process.env.ALLOWED_ROLE_ID, 
    process.env.ALLOWED_ROLE_ID2,
    process.env.ALLOWED_ROLE_ID3 // New role ID added here
]; 
const roleToManageId = process.env.ROLE_TO_MANAGE_ID; // Role ID to manage send messages permission
const lockEmoji = '❌';
const unlockEmoji = '✅';
const rememberFilePath = './remember.json';
const lockDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
const embedClearDuration = 5000; // 5 seconds in milliseconds

// Function to read the remember.json file
function readRememberFile() {
    if (!fs.existsSync(rememberFilePath)) {
        return {};
    }
    const data = fs.readFileSync(rememberFilePath);
    return JSON.parse(data);
}

// Function to write to the remember.json file
function writeRememberFile(data) {
    fs.writeFileSync(rememberFilePath, JSON.stringify(data, null, 2));
}

// Function to check if the cooldown has expired
function canExecuteCommand(lastExecuted, duration) {
    return !lastExecuted || (Date.now() - lastExecuted) > duration;
}

// Function to format the remaining time
function formatRemainingTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}

// Remember data structure
const rememberData = readRememberFile();
if (!rememberData.cooldowns) {
    rememberData.cooldowns = {};
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const channel = message.channel;
    const hasManageChannelsPermission = channel.permissionsFor(client.user).has('MANAGE_CHANNELS');
    const hasSendMessagesPermission = channel.permissionsFor(client.user).has('SEND_MESSAGES');

    if (!hasSendMessagesPermission) {
        const noBotPermissionEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Bot Permission Denied')
            .setDescription('I do not have permission to send messages in this channel.');

        await message.author.send({ embeds: [noBotPermissionEmbed] });
        return;
    }

    if (!hasManageChannelsPermission) {
        // Bot does not have permission to manage the channel
        const noBotPermissionEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Bot Permission Denied')
            .setDescription('I do not have permission to manage this channel.');

        const msg = await message.channel.send({ embeds: [noBotPermissionEmbed] });
        setTimeout(() => msg.delete(), embedClearDuration);
        setTimeout(() => message.delete(), embedClearDuration);
        return;
    }

    // Check if the user has any of the allowed roles
    if (!message.member.roles.cache.some(role => allowedRoleIds.includes(role.id))) {
        const noPermissionEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Permission Denied')
            .setDescription('You do not have permission to use this command.');

        const msg = await message.channel.send({ embeds: [noPermissionEmbed] });
        setTimeout(() => msg.delete(), embedClearDuration);
        setTimeout(() => message.delete(), embedClearDuration);
        return;
    }

    if (command === 'lock' || command === 'unlock') {
        const lastExecuted = rememberData.cooldowns[channel.id];
        const isLockCommand = command === 'lock';
        const alreadyLocked = channel.name.startsWith(lockEmoji);
        const alreadyUnlocked = !alreadyLocked;

        if ((isLockCommand && alreadyLocked) || (!isLockCommand && alreadyUnlocked)) {
            const alreadyStateEmbed = new MessageEmbed()
                .setColor(isLockCommand ? '#ff0000' : '#00ff00')
                .setTitle(isLockCommand ? 'Sysbots Already Offline' : 'Sysbots Already Online');

            const msg = await message.channel.send({ embeds: [alreadyStateEmbed] });
            setTimeout(() => msg.delete(), embedClearDuration);
            setTimeout(() => message.delete(), embedClearDuration);
            return;
        }

        if (!canExecuteCommand(lastExecuted, lockDuration)) {
            const remainingTime = lockDuration - (Date.now() - lastExecuted);
            const cooldownEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Command Cooldown')
                .setDescription(`Please wait for the cooldown period to expire before using the ${command} command again.\nTime remaining: ${formatRemainingTime(remainingTime)}`);

            const msg = await message.channel.send({ embeds: [cooldownEmbed] });
            setTimeout(() => msg.delete(), embedClearDuration);
            setTimeout(() => message.delete(), embedClearDuration);
            return;
        }

        if (isLockCommand) {
            const newName = `${lockEmoji}${channel.name.replace(unlockEmoji, '')}`;
            await channel.setName(newName);

            // Update role permissions to deny sending messages
            await channel.permissionOverwrites.edit(roleToManageId, { SEND_MESSAGES: false });

            // Update remember.json file
            rememberData[channel.id] = 'locked';
            rememberData.cooldowns[channel.id] = Date.now();
            writeRememberFile(rememberData);

            // Send lock message with embed
            const lockEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('SysBots Offline')
                .setDescription(`${message.author} has locked this channel.`);

            await message.channel.send({ embeds: [lockEmbed] });

        } else {
            const newName = `${unlockEmoji}${channel.name.replace(lockEmoji, '')}`;
            await channel.setName(newName);

            // Update role permissions to allow sending messages
            await channel.permissionOverwrites.edit(roleToManageId, { SEND_MESSAGES: null });

            // Update remember.json file
            rememberData[channel.id] = 'unlocked';
            rememberData.cooldowns[channel.id] = Date.now();
            writeRememberFile(rememberData);

            // Send unlock message with embed
            const unlockEmbed = new MessageEmbed()
                .setColor('#00ff00')
                .setTitle('SysBots Online')
                .setDescription(`${message.author} has unlocked this channel.`);

            await message.channel.send({ embeds: [unlockEmbed] });
        }

        // Delete the user's command message after 5 seconds
        setTimeout(() => message.delete(), embedClearDuration);
    }
});

client.login(process.env.BOT_TOKEN); // Use the bot token from .env file
