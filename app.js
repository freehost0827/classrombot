/* Add declared environment values */
    const env = require('dotenv').config(); // load .env file using dotenv node js module
    //console.log('env'+env);
    //console.log(env.parsed.WITAI_APP_API_TOKEN);
    if (env.error)
        throw env.error
    console.log(".env is added successfully.");

/* Construct dependencies */
    const {Wit, log} = require('node-wit');
    const SlackBot = require('slackbots');

/* Create clients */
    const CWitai = new Wit({ //
        accessToken: process.env.WITAI_APP_API_TOKEN // access WITAI_APP_API_TOKEN from .env file
    });
    //console.log(CWitai.message("How are you?"));
    //console.log(process.env.SLACK_APP_API_TOKEN);
    const CSlackBot = new SlackBot({
        token: process.env.SLACK_APP_API_TOKEN,
        name: 'GoodBot' // name of bot that will response to your expression in slack app
    })
 
    /*CSlackBot.on('start', function() {
        const params = {
            icon_emoji: ':squirrel:'
        };
        CSlackBot.postMessageToChannel('web-development', 'Hello, Everyone!', params);
    });*/

    var numPost = 0; // should not response to the message event
    CSlackBot.on('message', function(data) { // keep track when any message event happen in the channel
        if (data.type == 'hello') {
            const params = {
                icon_emoji: ':squirrel:'
            };
            CSlackBot.postMessageToChannel('web-development', 'Hello!', params); // use method provided by slackbots node js module
        }
        if (data.type != 'message') {
            return;
        } else {
            if (numPost == 1) { // should response to the message event
                responseBack(data.text);
            }
            numPost = 1;
        }
    });

    function responseBack(msg) {
        CWitai.message(msg, {}).then((data) => { // use method provided by node-wit node js module
            var ent = Object.keys(data.entities);
            console.log('All entity it is in : '+ent);
            // choose the last entity as its type
            if (ent.length > 1) {
                ent = ent[ent.length-1];
            } else {
                ent = ent;
            }
            var lent = String(ent);
            console.log('Last entity is : ' + lent);
            var response = "Sorry! I do not know how to response to \""+msg+"\"";
            switch (lent) {
                case 'datetime':
                    var d = data.entities.datetime[0]; // extract datetime
                    var date = new Date(d.value).toDateString();
                    response = date;
                    break;
                case 'bye':
                    response = "Ok, bye!"
                    break;
                case 'greetings':
                    response = getRandomExpr('gt')
                    break;
                case 'thanks':
                    response = getRandomExpr('thanks')
                    break;
                default:
            }
            doResponse(response);
        })
    }

    function doResponse(response) {
        const params = {
            icon_emoji: ':octocat:'
        };
        CSlackBot.postMessageToChannel('web-development', response, params);
        numPost = 0;
    }

    var greetings = ["Hey", "Hi", "Hey man!", "Hello!", "Hello, there!", "Yo!", "Good Day!", "Howdy!", "Hey, there!"];
    var thanks = ["You're welcome.", "No problem", "No worries", "Don't mention it", "My pleasure", "Anytime", "Ok", "That's fine"];
    function getRandomExpr(expr) { // generate random answer from the array and return it to user
        var what = greetings;
        if (expr == 'thanks') {
            what = thanks;
        }
        const random = Math.floor(Math.random()*what.length);
        return what[random];
    }
