import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { getAllTemplates } from "../../database.js";

export default {
    data: new SlashCommandBuilder()
        .setName("plantillas_guardadas")
        .setDescription("Muestra todas tus plantillas guardadas organizadas por tipo")
        .addStringOption(opcion => opcion
            .setName("tipo")
            .setDescription("Filtrar por tipo de plantilla")
            .addChoices(
                { name: "Todas", value: "todas" },
                { name: "AVA", value: "ava" },
                { name: "Party Personalizada", value: "party" },
                { name: "CTA", value: "cta" }
            )),

    async execute(interaction) {
        const tipoFiltro = interaction.options.getString("tipo") || "todas";
        const templates = await getAllTemplates(interaction.guildId);
        
        if (templates.length === 0) {
            return interaction.reply({ 
                content: "❌ No tienes plantillas guardadas. Usa /armar_party o /ava y guarda la configuración.", 
                flags: 64 
            });
        }

        // Filtrar por tipo si aplica
        let templatesFiltrados = templates;
        if (tipoFiltro !== "todas") {
            templatesFiltrados = templates.filter(t => {
                if (tipoFiltro === "ava") return t.tipo === "buff" || t.tipo === "full";
                if (tipoFiltro === "party") return t.tipo === "party";
                if (tipoFiltro === "cta") return t.tipo === "cta";
                return true;
            });
        }

        // Organizar por tipo
        const porTipo = {
            ava: templatesFiltrados.filter(t => t.tipo === "buff" || t.tipo === "full"),
            party: templatesFiltrados.filter(t => t.tipo === "party"),
            cta: templatesFiltrados.filter(t => t.tipo === "cta")
        };

        const embed = new EmbedBuilder()
            .setTitle("💾 Plantillas Guardadas")
            .setColor("#9b59b6")
            .setDescription(`Total: ${templatesFiltrados.length} plantillas`)
            .setFooter({ text: `Filtrado por: ${tipoFiltro === "todas" ? "Todas" : tipoFiltro.toUpperCase()}` })
            .setTimestamp();

        // Sección AVA
        if (porTipo.ava.length > 0) {
            const avaList = porTipo.ava.map(t => {
                const rolesCount = (t.roles_data || []).length;
                const tipoIcon = t.tipo === "buff" ? "🔮" : "⚔️";
                return `> **${tipoIcon} ${t.name}**\n>   └ 🛡️ ${t.tier} | 📍 ${t.lugar} | 👥 ${rolesCount} roles`;
            }).join("\n");
            embed.addFields({ 
                name: "🔮 AVA (Buff/Full)", 
                value: avaList || "Sin plantillas", 
                inline: false 
            });
        }

        // Sección Party Personalizada
        if (porTipo.party.length > 0) {
            const partyList = porTipo.party.map(t => {
                const categorias = (t.roles_data || []).map(r => r.label).join(", ");
                return `> **⚔️ ${t.name}**\n>   └ 🛡️ ${t.tier} | 📍 ${t.lugar} | 📋 ${categorias}`;
            }).join("\n");
            embed.addFields({ 
                name: "⚔️ Parties Personalizadas", 
                value: partyList || "Sin plantillas", 
                inline: false 
            });
        }

        // Sección CTA
        if (porTipo.cta.length > 0) {
            const ctaList = porTipo.cta.map(t => {
                const rolesCount = (t.roles_data || []).length;
                return `> **🎯 ${t.name}**\n>   └ 📍 ${t.lugar} | ⏰ ${t.hora} | 👥 ${rolesCount} roles`;
            }).join("\n");
            embed.addFields({ 
                name: "🎯 CTA", 
                value: ctaList || "Sin plantillas", 
                inline: false 
            });
        }

        // Crear menu de selección rápida
        const options = templatesFiltrados.slice(0, 24).map(t => ({
            label: t.name,
            value: t.id.toString(),
            description: `${t.tipo} | ${t.tier} | ${t.lugar}`,
            emoji: t.tipo === "buff" ? "🔮" : t.tipo === "party" ? "⚔️" : "🎯"
        }));

        if (options.length > 0) {
            const rowSelect = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("plantillas_rapidas_select")
                    .setPlaceholder("Selecciona una plantilla para usar...")
                    .addOptions([
                        { label: "Cancelar", value: "cancelar", emoji: "❌" },
                        ...options
                    ])
            );

            return interaction.reply({ 
                embeds: [embed], 
                components: [rowSelect],
                flags: 64 
            });
        }

        await interaction.reply({ embeds: [embed], flags: 64 });
    }
};
