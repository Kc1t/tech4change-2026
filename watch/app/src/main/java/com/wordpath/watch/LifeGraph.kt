package com.wordpath.watch

data class Rung(
    val level: Int,
    val kind: String,
    val text: String,
    val attr: String,
    val edge: String?,
    val isFinal: Boolean
)

data class Target(
    val id: String,
    val label: String,
    val kind: String,
    val attrs: Map<String, String>,
    val firstSyllable: String?,
    val edges: List<String>
)

object LifeGraph {

    private val KIND_LABEL = mapOf(
        "family" to "categoria",
        "category" to "categoria",
        "generation" to "relação",
        "city" to "lugar",
        "region" to "lugar",
        "use" to "uso",
        "shape" to "forma"
    )

    val targets = listOf(
        Target(
            id = "n_fd8f8a",
            label = "Letícia",
            kind = "person",
            attrs = linkedMapOf(
                "family" to "é da família",
                "generation" to "da geração dos netos",
                "city" to "mora em Sorocaba"
            ),
            firstSyllable = "Le",
            edges = listOf("e_8821", "e_8822", "e_9104")
        ),
        Target(
            id = "n_52a9aa",
            label = "Escumadeira",
            kind = "object",
            attrs = linkedMapOf(
                "category" to "é uma coisa da cozinha",
                "use" to "serve para tirar comida da panela",
                "shape" to "tem furos"
            ),
            firstSyllable = "Es",
            edges = listOf("e_6604")
        ),
        Target(
            id = "n_98b372",
            label = "Ubatuba",
            kind = "place",
            attrs = linkedMapOf(
                "category" to "é uma praia",
                "region" to "no litoral norte",
                "event" to "onde passavam o ano novo"
            ),
            firstSyllable = "U",
            edges = listOf("e_9311")
        )
    )

    fun projection(): String {
        val nodes = targets.joinToString(",") { target ->
            val keys = target.attrs.keys.joinToString(",") { "\"$it\"" }
            """{"id":"${target.id}","kind":"${target.kind}","attrKeys":[$keys],"hasPhonology":${target.firstSyllable != null}}"""
        }
        val edges = targets.flatMap { target ->
            target.edges.map { edge ->
                """{"id":"$edge","from":"n_b1d93d","to":"${target.id}","rel":"known_by","weight":0.9}"""
            }
        }.joinToString(",")

        return """{"owner":"n_b1d93d","nodes":[{"id":"n_b1d93d","kind":"person","attrKeys":[],"hasPhonology":false},$nodes],"edges":[$edges]}"""
    }

    fun ladder(target: Target, order: List<String>? = null): List<Rung> {
        val attrs = order?.filter { target.attrs.containsKey(it) }?.takeIf { it.isNotEmpty() }
            ?: target.attrs.keys.toList()

        val rungs = attrs.mapIndexed { index, attr ->
            Rung(
                level = index + 1,
                kind = KIND_LABEL[attr] ?: "relação",
                text = target.attrs.getValue(attr),
                attr = attr,
                edge = target.edges.getOrNull(index) ?: target.edges.lastOrNull(),
                isFinal = false
            )
        }

        val syllable = target.firstSyllable ?: return rungs
        return rungs + Rung(
            level = rungs.size + 1,
            kind = "pista sonora",
            text = "$syllable…",
            attr = "phon",
            edge = null,
            isFinal = true
        )
    }

    fun byId(id: String): Target? = targets.firstOrNull { it.id == id }

    fun kindFor(attr: String): String = KIND_LABEL[attr] ?: "relação"
}
