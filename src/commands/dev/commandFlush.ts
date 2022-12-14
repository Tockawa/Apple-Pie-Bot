import { CommandObject, CommandType } from "wokcommands";
import { REST, Routes } from "discord.js";
import { CommandInteraction } from "discord.js";

export default {
    description: "Deletes a command or all commands registered to the bot.",
    category: "Dev",
    nameLocalizations: {
        "en-US": "command-flush",
        "pt-BR": "limpar-comandos",
    },
    descriptionLocalizations: {
        "en-US": "Deletes a command or all commands registered to the bot.",
        "pt-BR": "Exclui um comando ou todos os comandos registrados no bot.",
    },
    type: CommandType.SLASH,
    guildOnly: true,
    testOnly: true,
    options: [
        {
            name: "command_id",
            description: "The command ID, leave blank to delete all commands.",
            type: 10,
            required: false,
        },
    ],
    ownerOnly: true,
    callback: async ({
        args,
        interaction,
    }: {
        args: string[];
        interaction: CommandInteraction;
    }) => {
        const rest = new REST({ version: "10" }).setToken(
            process.env.DISCORD_TOKEN as string
        );

        const commandId = args[0] as string;
        if (!commandId) {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID as string),
                { body: [] }
            );
            return "Successfully deleted all commands, you should restart the bot so the actual commands you have will be integrated again.";
        } else {
            await rest.delete(
                Routes.applicationGuildCommand(
                    process.env.CLIENT_ID as string,
                    interaction.guildId as string,
                    commandId
                )
            );
            return "Successfully deleted command.";
        }
    },
} as CommandObject;
