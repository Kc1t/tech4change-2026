package com.wordpath.watch

import android.util.Log
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

data class CuePlan(
    val targetId: String,
    val order: List<String>,
    val origin: String
)

object CueClient {

    private const val TAG = "CueClient"
    private const val TIMEOUT_MS = 2500

    suspend fun rank(subject: String, activeNode: String, lastLevel: Int?): CuePlan? =
        withContext(Dispatchers.IO) {
            val payload = buildString {
                append("""{"subject":"$subject",""")
                append(""""projection":${LifeGraph.projection()},""")
                append(""""activeNodes":["$activeNode"],""")
                append(""""hints":{},""")
                append(""""lastLevel":${lastLevel ?: "null"}}""")
            }

            try {
                val connection = (URL("${BuildConfig.API_URL}/v1/cue/rank").openConnection()
                        as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = TIMEOUT_MS
                    readTimeout = TIMEOUT_MS
                    doOutput = true
                    setRequestProperty("content-type", "application/json")
                }

                connection.outputStream.use { it.write(payload.toByteArray()) }

                if (connection.responseCode !in 200..299) {
                    Log.w(TAG, "Rank refused with ${connection.responseCode}")
                    return@withContext null
                }

                val body = connection.inputStream.bufferedReader().use { it.readText() }
                parse(body)
            } catch (error: Exception) {
                Log.w(TAG, "Rank unavailable: ${error.javaClass.simpleName}")
                null
            }
        }

    private fun parse(body: String): CuePlan? {
        val json = JSONObject(body)
        val targetId = json.optString("targetId").takeIf { it.isNotEmpty() } ?: return null
        val steps = json.optJSONArray("steps") ?: return null

        val order = (0 until steps.length()).mapNotNull { index ->
            steps.optJSONObject(index)?.optString("attr")?.takeIf { it.isNotEmpty() }
        }

        return CuePlan(targetId, order, json.optString("origin", "deterministic"))
    }
}
