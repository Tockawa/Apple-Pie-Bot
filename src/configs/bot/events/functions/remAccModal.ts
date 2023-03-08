import { ModalSubmitInteraction, Interaction, EmbedBuilder } from "discord.js";
import { decryptAesGcm } from "../../../functions/vault";
import { compare } from "bcrypt";
import passwd from "../../../db/models/passwd";
import lang from "../../../languages/languages";

export async function rem_modal(
    interaction: Interaction,
    modalInteraction: ModalSubmitInteraction
) {
    const mInteraction = modalInteraction;
    await mInteraction.deferReply({ ephemeral: true });

    const masterKeyInput = mInteraction.fields.fields.map(
        (fields) => fields.value
    )[1];
    const accountNameInput = mInteraction.fields.fields.map(
        (fields) => fields.value
    )[0];

    const accountsDb = await passwd.findOne(
        {
            _id: interaction.user.id,
        },
        {
            accounts: {
                $elemMatch: {
                    account_name: accountNameInput,
                },
            },
        }
    );
    if (!accountsDb) {
        return await mInteraction.editReply({
            content: lang(
                interaction.user,
                "decr",
                "decr_account_doesnt_exist"
            ),
        });
    }

    const accountDb = accountsDb.accounts[0] as {
        account_name: string;
        account_passwd: string;
        masterKey: string;
        createdAt: string;
    };
    const masterKeyCompare = await compare(masterKeyInput, accountDb.masterKey);

    if (!masterKeyCompare) {
        return await mInteraction.editReply({
            content: lang(interaction.user, "decr", "decr_invalid_masterkey"),
        });
    }

    const decryptedPasswd = decryptAesGcm(
        accountDb.account_passwd,
        masterKeyInput
    );

    if (!decryptedPasswd) {
        return await mInteraction.editReply({
            content: lang(interaction.user, "decr", "decr_invalid_masterkey"),
        });
    }

    const { username } = interaction.user;

    await passwd.updateOne(
        {
            _id: interaction.user.id,
        },
        {
            $pull: {
                accounts: {
                    account_name: accountNameInput,
                },
            },
        }
    );

    return await mInteraction.editReply({
        embeds: [
            new EmbedBuilder()
                .setAuthor({
                    name: username,
                    iconURL: interaction.user.displayAvatarURL({
                        forceStatic: false,
                    }),
                })
                .setTitle(
                    lang(
                        interaction.user,
                        "passwd_rem",
                        "rem_modal_success"
                    ) as string
                )
                .setDescription(
                    lang(
                        interaction.user,
                        "passwd_rem",
                        "rem_modal_success_desc"
                    ).replace("{0}", accountNameInput)
                )
                .setColor("Random")
                .setTimestamp()
                .setFooter({
                    text: lang(interaction.user, "help", "help-footer"),
                    iconURL: interaction.client.users.cache
                        .find((user) => user.id === "876578406144290866")
                        ?.displayAvatarURL({
                            forceStatic: false,
                        }),
                }),
        ],
    });
}
