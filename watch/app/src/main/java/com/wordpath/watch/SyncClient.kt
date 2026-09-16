package com.wordpath.watch

import android.util.Log
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.isActive
import kotlinx.coroutines.withContext
import org.json.JSONObject

data class SyncCue(
    val targetId: String,
    val level: Int,
    val attr: String,
    val edge: String?,
    val isFinal: Boolean,
    val event: String
)

object SyncClient {

    private const val TAG = "SyncClient"
    private const val CONNECT_TIMEOUT_MS = 4000

    suspend fun discover(): String? = withContext(Dispatchers.IO) {
        try {
            val connection = open("/v1/sync/sessions/open", "GET")
            if (connection.responseCode !in 200..299) return@withContext null
            val body = connection.inputStream.bufferedReader().use { it.readText() }
            JSONObject(body).optString("code").takeIf { it.isNotEmpty() && it != "null" }
        } catch (error: Exception) {
            Log.w(TAG, "Discover failed: ${error.javaClass.simpleName}")
            null
        }
    }

    suspend fun join(code: String): String? = withContext(Dispatchers.IO) {
        val payload = """{"kind":"watch","name":"Relógio"}"""
        try {
            val connection = open("/v1/sync/sessions/$code/devices", "POST")
            connection.outputStream.use { it.write(payload.toByteArray()) }
            if (connection.responseCode !in 200..299) return@withContext null
            val body = connection.inputStream.bufferedReader().use { it.readText() }
            JSONObject(body).optString("id").takeIf { it.isNotEmpty() }
        } catch (error: Exception) {
            Log.w(TAG, "Join failed: ${error.javaClass.simpleName}")
            null
        }
    }

    suspend fun heartbeat(code: String, deviceId: String) = withContext(Dispatchers.IO) {
        runCatching { open("/v1/sync/sessions/$code/devices/$deviceId/heartbeat", "POST").responseCode }
    }

    suspend fun stream(code: String, onCue: (SyncCue) -> Unit) = withContext(Dispatchers.IO) {
        while (isActive) {
            try {
                val connection = open("/v1/sync/sessions/$code/stream", "GET").apply {
                    readTimeout = 0
                    setRequestProperty("accept", "text/event-stream")
                }

                connection.inputStream.bufferedReader().use { reader ->
                    while (isActive) {
                        val line = reader.readLine() ?: break
                        if (!line.startsWith("data:")) continue
                        parse(line.removePrefix("data:").trim())?.let(onCue)
                    }
                }
            } catch (error: Exception) {
                Log.w(TAG, "Stream dropped: ${error.javaClass.simpleName}")
            }
        }
    }

    private fun parse(payload: String): SyncCue? {
        val json = runCatching { JSONObject(payload) }.getOrNull() ?: return null
        if (json.optString("type") != "cue") return null
        val cue = json.optJSONObject("cue") ?: return null

        return SyncCue(
            targetId = cue.optString("targetId"),
            level = cue.optInt("level"),
            attr = cue.optString("attr"),
            edge = cue.optString("edge").takeIf { it.isNotEmpty() && it != "null" },
            isFinal = cue.optBoolean("isFinal"),
            event = cue.optString("event")
        )
    }

    private fun open(path: String, method: String): HttpURLConnection =
        (URL("${BuildConfig.API_URL}$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = CONNECT_TIMEOUT_MS
            doOutput = method == "POST"
            setRequestProperty("content-type", "application/json")
        }
}
