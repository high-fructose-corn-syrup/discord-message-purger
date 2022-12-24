# discord-message-purger

Delete all of the messages in a specified channel or guild given search-like parameters. Takes awhile. 

### Warning
As with any API use like this, expect the potential sideaffect that you'll get banned. I've deleted millions of messages over the span of years without any issues though. 

### Usage
1. Make a file with your authorization bearer (discord token) and name it something. I prefer "secret.key"
2. Edit the `purge.bat` file and set the specified guild. Inside `src/index.js` you can find extra flags you can use too.
* guild_id : The snowflake for the guild you wish to delete messages from. 
* channel_id : The snowflake for the channel you wish to delete messages from.
* author_id : The snowflake for the author you wish to delete messages from. You will need permissions to do so if this is not your own ID.
* has : The type of message to look for. "file", "image", ... 
* sort_order : Whether you should sort descending or ascending. "asc" for ascending. 
* max_id : The max snowflake to search up to. Can be useful if you don't want to delete messages after a certain point. Maybe you're deleting old messages and don't want people to notice. 
3. Run `purge.bat`. It will automatically open a new instance if it crashes. Most oftenly from a network issue like a dropped connection not being handled correctly due to my incompetency. 
