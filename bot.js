const botSettings = require("./botsettings.json");
const Discord = require("discord.js");
const fs = require("fs");

const prefix = botSettings.prefix;

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

fs.readdir("./cmds", (err, files) => {
    if(err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <= 0) {
        console.log("No commands to load!")
        return;
    }

    console.log(`loading ${jsfiles.lengtch} commands!`);

    jsfiles.forEach((f, i) => {
        let props = require(`./cmds/${f}`);
        console.log(`${i + 1}: ${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});

bot.on("ready", async () => {
    console.log(`${bot.user.username} has awoken!`);
    bot.user.setStatus('Online')
    bot.user.setActivity(`${bot.guilds.size} servers | $help`);
    console.log(bot.commands);
    console.log(bot.commands);

    try {
        let link = await bot.generateInvite(["ADMINISTRATOR"]);
        console.log(link);
    } catch(e) {
        concole.log(e.stack);
    }

});

bot.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return;

    if(command === `${prefix}userinfo`) {
        let embed = new Discord.RichEmbed()
            .setAuthor(message.author.username)
            .setDescription("Part of the BEST Server ever!")
           .setColor("#78f5ff")
            .addField("Full Username", `${message.author.username}#${message.author.discriminator}`)
            .addField("ID", message.author.id)
            .addField("Created At", message.author.createdAt);

        message.channel.sendEmbed(embed);
      return;
    }

    if(command === `${prefix}mute`) {
        if(!message.member.hasPermission("MANAGE_MESSAGES"))
        return message.reply("Sorry, you don't have permissions to use this!");

        let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if(!toMute) return message.channel.sendMessage(" `You didn't specify a user mention or ID!` ")

        let role = message.guild.roles.find(r => r.name === "Muted");
        if(!role) {
            try{
                role = await message.guild.createRole({
                    name: "Muted",
                    color: "#000000",
                    permissions: []
                });
    
                message.guild.channels.forEach(async (channel, id) => {
                    await channel.overwritePermissions(role, {
                        SEND_MESSAGES: false, 
                        ADD_REACTIONS: false
                    });
                });
             } catch(e) {
                    console.log(e.stack);
            }
        }
        
        if(toMute.roles.has(role.id)) return message.channel.sendMessage(" `This user is already muted!` ");

        await toMute.addRole(role);
        message.channel.sendMessage("Muted!");



        return;

    }

    if(command === `${prefix}unmute`) {
        if(!message.member.hasPermission("MANAGE_MESSAGES"))
        return message.reply("Sorry, you don't have permissions to use this!");
        let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if(!toMute) return message.channel.sendMessage(" `You didn't specify a user mention or ID!` ")

        let role = message.guild.roles.find(r => r.name === "Muted");
      
        if(!role || !toMute.roles.has(role.id)) return message.channel.sendMessage(" `This user isn't muted!` ");
       
        await toMute.removeRole(role);
        message.channel.sendMessage("Unmuted!");



        return;

    }



    if (command === `${prefix}kick`) {
        if(!message.member.hasPermission("KICK_MEMBERS"))
        return message.reply("Sorry, you don't have permissions to use this!");
        let member = message.mentions.members.first() || message.guild.members.get(args[0]);
        if (!member)
            return message.reply("Please mention a valid member of this server");
        if (!member.kickable)
            return message.reply(" `I cannot kick this user! Do they have a higher role?` ");
            let reason = args.slice(1).join(' ');
            if(!reason) reason = " `No reason provided` ";
            await member.kick(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
          message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
      
        }




    if (command === `${prefix}ban`) {
        if(!message.member.hasPermission("BAN_MEMBERS"))
        return message.reply("Sorry, you don't have permissions to use this!");
      let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
      message.reply(`${member.user.tag} has been Banned by ${message.author.tag} because: ${reason}`);
  } 

if(command === `${prefix}purge`) {
    if(!message.member.hasPermission("MANAGE_MESSAGES"))
    return message.reply("Sorry, you don't have permissions to use this!");
    const deleteCount = parseInt(args[0], 10);
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
    return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(` Couldn't delete messages because of: ${error} `));
      message.reply('Purged! :white_check_mark: ')
  .then(msg => {
    msg.delete(1000)
  })
  .catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);
  }

  if(command === `${prefix}help`) {
    var embedhelpmember = new Discord.RichEmbed() 
        .setTitle("**Commands**\n")
        .addField(" $help", "Displays this message")
        .addField(" $userinfo", "Tells info about you") 
        .setColor("#78f5ff") 
        .addField(" $mute", "Mutes a desired member with a reason (Coorect usage: $mute @username [reason]")
        .addField(" $unmute", "Unmutes a muted player (Correct usage: $unmute @username)")
        .addField(" $kick", "Kicks a desired member with a reason (Correct usage: $kick @username [reason])") 
        .addField(" $ban", "Bans a desired member with a reason (Correct usage: $ban @username [reason])")
        .addField(" $purge", "Mass deletes messages (Correct usage: $purge [number])")
        .addField(" $server", "Shows info about the server")
        .addField(" $invite", "Gives you an invite link for the bot")
        .setFooter("Bot Developed by💀Echo#6395" ) 
    message.channel.send(embedhelpmember);
    
}

    else if (message.content === `${prefix}invite`) {
        message.author.send(" `https://discordapp.com/oauth2/authorize?client_id=442666619651489813&permissions=8&scope=bot` ");
    }



    if(command === `${prefix}server`) {
        let embed = new Discord.RichEmbed()
            .setAuthor(message.author.username)
            .setDescription("Server information")
           .setColor("#78f5ff")
            .addField("Server Name:", `${message.guild.name}`)
            .addField("Total Members:", `${message.guild.memberCount}`);

        message.channel.sendEmbed(embed);
      return;
    }

    

});


bot.login(botSettings.token);
