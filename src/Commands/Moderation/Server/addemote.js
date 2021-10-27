const   
    {errorHandle} = require("@configs/other/errorHandle"),
    {checkGuild} = require("@configs/other/checkGuild"), 
    {emojiAdd} = require("@configs/Moderation/emojiAdd");
    
module.exports = {
    aliases: ["ae", "addemoji"],
    //Não sei a diferença entre emoji e emote, é tipo bolacha e biscoito tlgd? Os dois servem!!!
    run: async(client, messageCreate, args) => {
        const{author} = messageCreate
        try {
            const verify = await checkGuild(messageCreate, author, true)
            if(verify !== true) return 

            if(messageCreate.attachments.first()) {
                let attachment = messageCreate.attachments.first()
                let attachmentURL = attachment.attachment
                await emojiAdd(messageCreate, args[0], args[1], author, attachmentURL)
            } else {
                await emojiAdd(messageCreate, args[0], args[1], author)
            }

            
        } catch (error) {
            await errorHandle(messageCreate, author, error)
        }
    }
}