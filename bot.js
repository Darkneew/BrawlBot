//INITIALISATION
const Discord = require('discord.js');
const fs = require('fs');
const prefix = "|";
const token = 'insert bot token';
const bot = new Discord.Client();
bot.login(token);
const ffmpeg = require('ffmpeg');
const YouTube = require('youtube-node');
const ytdl = require('ytdl-core');
var streamOptions = { seek: 0, volume: 1 };
var youTube = new YouTube();
youTube.setKey('insert youtube token');
bot.on('ready', () => {
    console.log("Ca fonctionne!")
    bot.user.setActivity("la meilleure team", {type: 3});
});
var queue = [];
var Dispatcher;

//Creer un compte brawl
function brawlcreate(message) {
    let users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
    if (users[message.author.id]) return false;
    users[message.author.id] = {
        "tr":0,
        "pseudo":message.author.username,
        "favgame":"Aucun",
        "brawlers":{
            "favs":[],
            "sniper":{"fav":"Aucun","liste":[]},
            "dps":{"fav":"Aucun","liste":[]},
            "speed":{"fav":"Aucun","liste":[]},
            "tempo":{"fav":"Aucun","liste":[]},
            "tank":{"fav":"Aucun","liste":[]},
            "campeur":{"fav":"Aucun","liste":[]},
            "soin":{"fav":"Aucun","liste":[]},
            "zone":{"fav":"Aucun","liste":[]},
            "soutien":{"fav":"Aucun","liste":[]}
        },
        "compos":{
            "braquage":{"fav":"Aucun","liste":[]},
            "siege":{"fav":"Aucun","liste":[]},
            "survivant":{"fav":"Aucun","liste":[]},
            "gemgrab":{"fav":"Aucun","liste":[]},
            "bounty":{"fav":"Aucun","liste":[]},
            "brawlball":{"fav":"Aucun","liste":[]},
            "bossfight":{"fav":"Aucun","liste":[]},
            "robot":{"fav":"Aucun","liste":[]}
        }
    };
    fs.writeFile("./users.json", JSON.stringify(users), (x) => {
        if (x) console.error(x)
      });
    return users;
}

//function play music
function stream(Turl, message, connection) {
    const Tstream = ytdl(Turl);
        Dispatcher = connection.playStream(Tstream, streamOptions).on("end", () => {
            if (queue.length >= 1) {
                var Aobj = queue.shift();
                stream(Aobj[0], message, connection);
                message.channel.send('Je joue maintenant ' + Aobj[1])
            }
            else {
                message.channel.send('Plus de musique en queue, je quitte le vocal.')
                let Me = message.guild.members.find("user", bot.user)
                Me.voiceChannel.leave();
            }
        })
}

//FONCTION RECHERCHE
function findUrl (Sname) {
    if (Sname.startsWith('www.youtube.com/watch?v=')||Sname.startsWith('https://www.youtube.com/watch?v=')) {
        let id = Sname.split('/watch?v=').splice(1).join('/watch?v=')
        var promise1 = new Promise((resolve, reject) => {youTube.getById(id, function(error, Tresult) {
            if (error) {
              console.log(error);
            }
            else {
                let Mname =  Tresult.items[0].snippet.title || Tresult.items[1].snippet.title;
                resolve([Sname, Mname]);
            }
          })});
          return promise1;
        }
        else {
            var promise1 = new Promise( (resolve, reject) => {
            youTube.search(Sname , 2, function(error, result) {
            if (error) {
                console.log(error);
            }
            else {
                let Tresult = JSON.parse(JSON.stringify(result, null, 2));
                let videoId = Tresult.items[0].id.videoId || Tresult.items[1].id.videoId;
                var Turl = 'https://www.youtube.com/watch?v=' + videoId;
                var Mname =  Tresult.items[0].snippet.title || Tresult.items[1].snippet.title;
                resolve([Turl, Mname]);
            }
            })})
            return promise1;
        };

}

bot.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.guild) return;
    let messageWprefix = message.content.split("").splice(1).join("");
    let Me = message.guild.members.find("user", bot.user);
    //SEARCH
    if (messageWprefix.startsWith('rechercher')) {
        let name = messageWprefix.split(" ").splice(1).join(" ")
        if (!name) return message.channel.send('Cherches quelque chose, c\'est plus utile');
        youTube.search(name , 2, function(error, result) {
            if (error) {
              console.log(error);
            }
            else {
                let Tresult = JSON.parse(JSON.stringify(result, null, 2));
                let videoId = Tresult.items[0].id.videoId || Tresult.items[1].id.videoId
                let url = 'https://www.youtube.com/watch?v=' + videoId
                message.channel.send(url)
            }
          });
    }
    //CLEAR
    else if (messageWprefix.startsWith('purger')) {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Touches pas à ça, c'est pas de ton âge :confused:");
        let deleteNumberstr = message.content.split(" ").slice(1);
        let deleteNumber = parseInt(deleteNumberstr, 10);
        if (!deleteNumber) {
            let arrprefix = message.content.split("d");
            message.channel.send("C'est la mauvaise méthode pour supprimer un historique :weary:\nTu devrais faire: " + arrprefix[0] + "purge [nombre de messages à supprimer]\nAussi, les valeurs en dessous de 1 ne sont pas acceptées, *logique*");
            return;
        }
        if ((deleteNumber <= 0)||(deleteNumber>100)) {
            message.channel.send("C'est la mauvaise méthode pour supprimer un historique :weary:\nTu devrais choisir un nombre entre 1 et 100")
        }
        else {
        message.channel.bulkDelete(deleteNumber);
        }
    }
    //HELP
    else if (messageWprefix.startsWith('aide basique')) {
        let serverembed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setAuthor('BRAWLBOT - PREFIXE : |')
        .setTitle("commandes basiques:")
        .addField("|jouer [nom de la musique ou url]","Pour jouer une musique, si je ne suis pas déjà en train d'en jouer une")
        .addField("|rechercher [nom de la musique]","Pour trouver l'url d'une musique en fonction de son nom")
        .addField("|passer", "Pour passer une musique")
        .addField("|stopper", "Pour arrêter toute les musiques et nettoyer la file d'attente")
        .addField("|aide","Pour avoir de l'aide :)")
        .addField("|purger [nombre]","Pour supprimer un certain nombre de messages, entre 1 et 100")
        .addField("|ping","Pour avoir mon ping")
        .addField("|membres","Pour avoir le nombre de membres dans le server, et leurs noms.")
        message.channel.send(serverembed);
    }
    else if (messageWprefix.startsWith('aide queue')) {
        let serverembed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setAuthor('BRAWLBOT - PREFIXE : |')
        .setTitle("commandes de la queue:")
        .addField("|queue montrer","To display the current queue")
        .addField("|stoppe", "To clear the queue (stop also the music)")
        .addField("|queue ajouter [nom de la musique ou url]", "Pour ajouter une musique en fonction de l'url ou de son nom")
        .addField("|playliste queue [nom de la playliste]","Pour ajouter une musique dans la file d'attente")
        message.channel.send(serverembed);
    }
    else if (messageWprefix.startsWith('aide playliste')) {
        let serverembed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setAuthor('BRAWLBOT - PREFIXE : |')
        .setTitle("commandes pour les playlistes:")
        .addField("|playliste montrer [nom de la playliste]","Pour montrer les droits, musiques et l'auteur de la playliste")
        .addField("|playliste lister [mention d'une personne (optionel)]","Pour montrer toute les playlistes qui existe. Mentionner quelqu'un montre juste ses playlistes.")
        .addField("|playliste créer [ouvert | fermé] [nom de la playliste]", "Pour créer une nouvelle playliste. Si les droits son ouverts, n'importe qui peut modifier la playliste.")
        .addField("|playliste add [song name or url]", "To add a song to the playlist")
        .addField("|playliste queue [playlist name]","To add a playlist to the queue")
        message.channel.send(serverembed);
    }
    else if (messageWprefix.startsWith('aide brawl')) {
        let serverembed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setAuthor('BRAWLBOT - PREFIXE : |')
        .setTitle("commandes pour brawlstar:")
        .addField("brawl profile [mention]","Pour voir le profile d'un des membres. Si personne n'est mentionné, je vous montre votre propre profil.")
        .addField("brawl modifier","Pour modifier vos paramètres")
        .addField("brawlers montrer", "Pour montrer vos brawlers préférés")
        .addField("brawlers modifier","Pour modifier vos brawlers préférés")
        .addField("compo montrer", "Pour montrer vos compositions préférés")
        .addField("brawl modifier","Pour modifier vos compositions préférés");
        message.channel.send(serverembed);
    }
    else if (messageWprefix.startsWith('aide')) {
        let serverembed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setAuthor('BRAWLBOT - PREFIXE : |')
        .setTitle("commandes:")
        .addField("commandes basiques","Ecrit `|aide basique` pour avoir de l'aide sur les trucs basiques")
        .addField("commandes pour les playlistes", "Ecrit `|aide playliste` pour avoir de l'aide sur le système de playliste")
        .addField("commandes pour la queue", "Ecrit `|aide queue` pour avoir de l'aide sur la file d'attente")
        .addField("commandes de brawlstar", "Ecrit `|aide brawl` pour avoir de l'aide sur les commandes spécifiques à brawlstar");
        message.channel.send(serverembed);
    }
    //PING
    else if (messageWprefix.startsWith('ping')) {
        message.channel.send('En cours de ping...')
        let pings = bot.pings
        pings.forEach(ping => {
            message.channel.send(`:o: ${ping}`)
        });
    }
    //MEMBERCOUNT
    else if (messageWprefix.startsWith('membres')) {
        let arr = [];
        message.guild.members.forEach((member) => {arr.push(member.user.username)});
        let embed = new Discord.RichEmbed()
        .setTitle(`**${message.guild.memberCount} Membres dans ce serveur**`)
        .addField("Voici une liste d'eux:",arr.join(", "));
        message.channel.send(embed);
    }
    //Display Queue
    else if (messageWprefix.startsWith('queue montrer')) {
        if (queue.length < 1) return message.channel.send('Il n\'y a pas de queue :/');
        message.channel.send('Voici une liste de toute les musiques en queue en ce moment :')
        queue.forEach(obj => {
            message.channel.send(`- ${obj[1]}`)
        });
    }
    //CREATE playlist
    else if (messageWprefix.startsWith('playliste créer') || messageWprefix.startsWith('playliste creer')) {
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        let Trights = messageWprefix.split(' ')[2]
        if (!(Trights == 'ouvert' || Trights == 'fermé' || Trights == 'ferme')) return message.channel.send(`Désolé, ceci est la mauvaise méthode! Tu devrais faire \`\`\`${prefix}playliste créer [ouvert | fermé] [nom de la playliste]\`\`\``);
        let name = messageWprefix.split(' ').splice(3).join(" ");
        if (!name) return message.channel.send(`Désolé, ceci est la mauvaise méthode! Tu devrais faire \`\`\`${prefix}playliste créer [ouvert | fermé] [nom de la playliste]\`\`\``);
        if (name.indexOf(' ') >= 0 ) return message.channel.send('Désolé, le nom ne doit être constitué que d\'un mot');
        if (playlists[name]) return message.channel.send('Une playliste de ce nom existe déjà.');
        if (Trights == 'ouvert') Trights = 'open'
        else Trights = 'close'
        playlists[name] = {
            author : message.author.id,
            musics : [],
            rights : Trights
            };
        fs.writeFile("./playlists.json", JSON.stringify(playlists), (x) => {
            if (x) console.error(x)
          });
        message.channel.send(`Bien joué, tu as créé une playliste nommée ${name}`)
    }
    //QUEUE ADD
    else if (messageWprefix.startsWith('queue ajouter')) {
        let Aname = messageWprefix.split(' ').splice(2).join(' ');
        if ((!message.member.voiceChannel)&&(!Me.voiceChannel)) return message.channel.send('Tu n\'est même pas en vocal!');
        let promise = findUrl(Aname);
        promise.then( (obj) => {
            queue.push(obj);
            message.channel.send('`' + obj[1] + '` ajouter avec succès à la queue');
            if (!Me.voiceChannel) {
                message.member.voiceChannel.join()
                .then(connection => {
                message.channel.send('J\'ai bien rejoint ton vocal!');
                var Aobj = queue.shift();
                stream(Aobj[0], message, connection);
                message.channel.send('Je joue maintenant ' + Aobj[1]);
            })}
        })
    }
    //PLAYLIST ADD
    else if (messageWprefix.startsWith('playliste ajouter')) {
        let playlistName = messageWprefix.split(' ')[2];
        if (!playlistName) return message.channel.send(`C\'est une blague? Vous devez entrer \`\`\`${prefix}playliste ajouter [nom de la playliste] [nom de la musique ou url]\`\`\``)
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        if (!playlists[playlistName]) message.channel.send("Cette playliste n'existe pas.");
        let rights = playlists[playlistName].rights;
        if ((rights != 'open')&&(playlists[playlistName].author != message.author.id)) return message.channel.send('Vous n\'avez pas les droits pour modifier cette playliste');
        let name = messageWprefix.split(" ").splice(3).join(" ")
        if (!name) return message.channel.send('Essaie d\'ajouter quelque chose, c\'est en général plus utile');
        let promise = findUrl(name);
        promise.then( (obj) => {
        let Fobj = {
            url : obj[0],
            name:obj[1]
        }
        playlists[playlistName].musics.push(Fobj);
        fs.writeFile("./playlists.json", JSON.stringify(playlists), (x) => {
            if (x) console.error(x)
          });
        message.channel.send(`Vous avez ajouté la musique \`${obj[1]}\` à la playliste, bien joué!`)})
    }
    //PLAYLIST LIST
    else if (messageWprefix.startsWith('playliste lister')) {
        let User = message.mentions.users.first();
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        if (User) {
            message.channel.send('Voici une liste de toute les playlistes faites par ' + User.username + ' :');
            for (var key in playlists) {
                if (playlists[key].author == User.id) message.channel.send(`- ${key}`)
            }
            return
        }
        message.channel.send('Voici une liste de toute les playlistes :');
        for (var key in playlists) {
            message.channel.send(`- ${key}`)
        }
    }
    //DISP PLAYLIST
    else if (messageWprefix.startsWith('playliste montrer')) {
        let Pname = messageWprefix.split(' ')[2];
        if (!Pname) return message.channel.send('Veuillez préciser une playliste')
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        if (!playlists[Pname]) return message.channel.send('Cette playliste n\'existe pas');
        let playlist = playlists[Pname].musics;
        let id = playlists[Pname].author;
        let rights = playlists[Pname].rights;
        if (rights == 'open') rights = 'ouverts';
        else rights = 'fermés'
        let user = bot.users.find('id', id).username;
        message.channel.send(`L'auteur de la playliste est ${user}\n`);
        message.channel.send(`Les droits sur cette playliste sont ${rights}\n`);
        message.channel.send('Voici les musiques de cette playliste :')
        playlist.forEach(music => {
            message.channel.send(' - ' + music.name);
        });
    }
    //SKIP
    else if (messageWprefix.startsWith('passer')) {
        if (!Dispatcher) return message.channel.send('Rien à passer');
        Dispatcher.end();
    }
    //STOP
    else if (messageWprefix.startsWith('stopper')) {
        if (!Dispatcher) return message.channel.send('Rien à arrêter');
        queue = []
        Dispatcher.end();
    }
    // BRAWL PROFILE
    else if (messageWprefix.startsWith("brawl profile")) {
        let user = message.mentions.users.first() || message.author;
        let users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
        if (!users[user.id]) users = brawlcreate(message);
        let profile = users[user.id];
        let embed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setTitle(`Profile de ${user.username}`)
        .addField("Nom sur brawlstar:", profile.pseudo, true)
        .addField("Nombre de trophés", profile.tr, true)
        .addField("Brawlers préférés:", profile.brawlers.favs.join(", ") || "Aucun", true)
        .addField("Mode de jeu préféré:", profile.favgame || "Aucun");
        message.channel.send(embed);

    }
    //PLAYLIST QUEUE
    else if (messageWprefix.startsWith('playliste queue')) {
        if ((!message.member.voiceChannel)&&(!Me.voiceChannel)) return message.channel.send('Vous n\'êtes même pas dans un vocal!');
        let playlistName = messageWprefix.split(' ').splice(2)[0];
        if (!playlistName) return message.channel.send('Veuillez spécifier le nom de la playliste à ajouter à la queue');
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        if (!playlists[playlistName]) return message.channel.send('Cette playliste n\'existe pas');
        let playlist = playlists[playlistName].musics;
        playlist.forEach(music => {
            let Nobj = [music.url, music.name];
            queue.push(Nobj);
            message.channel.send(`\`${music.name}\` ajouté à la queue`)
        });
        if (!Me.voiceChannel) {
            message.member.voiceChannel.join()
            .then(connection => {
            message.channel.send('Je me suis connecté à votre vocal avec succès!');
            var Aobj = queue.shift();
            stream(Aobj[0], message, connection);
            message.channel.send('Je joue maintenant ' + Aobj[1]);
        })}
    }
    //PLAY
    else if (messageWprefix.startsWith('jouer ')) {
        if (!message.member.voiceChannel) return message.channel.send('Tu n\'est même pas en vocal!');
        if (Me.voiceChannel) {
            if (Me.voiceChannel != message.member.voiceChannel) return message.channel.send('Désolé, je suis déjà dans un autre vocal')
            message.channel.send('Je suis déjà en train de jouer quelque chose.. \nSi tu veux que ta musique passe après, écrits juste `|queue ajouter [musique]`\nSi tu veux effacer la queue et jouer ta musique tout de suite, ecrits simplement `|stopper` puis recommence ta commande.');
        } else {
        message.member.voiceChannel.join()
        .then(connection => {
            message.channel.send('Je me suis bien connecté au vocal!');
        let name = messageWprefix.split(" ").splice(1).join(" ")
        if (!name) return message.channel.send('Essaye de jouer quelque chose, c\'est plus utile');
        if (name.startsWith('www.youtube.com/watch?v=')||name.startsWith('https://www.youtube.com/watch?v=')) {
            stream(name, message, connection);
            message.channel.send('Le jouant avec succès')
        }
        else {
            youTube.search(name , 2, function(error, result) {
            if (error) {
                console.log(error);
            }
            else {
                let Tresult = JSON.parse(JSON.stringify(result, null, 2));
                let videoId = Tresult.items[0].id.videoId || Tresult.items[1].id.videoId
                let Turl = 'https://www.youtube.com/watch?v=' + videoId;
                stream(Turl, message, connection);
                message.channel.send(`Jouant la musique avec succès`)
            }
        });
        }
    })
    .catch(console.log);}}
    else {
        return message.channel.send('Désolé, je n\'étais pas au courant de cette commande.');
    }
});
