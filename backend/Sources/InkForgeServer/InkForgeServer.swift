import Vapor

struct HealthResponse: Content {
    let status: String
    let application: String
    let version: String
}

@main
struct InkForgeServer {
    static func main() async throws {
        let app = try await Application.make(.development)

        app.get { _ in
            "Welcome to InkForge API"
        }

        app.get("api", "health") { _ in
            HealthResponse(
                status: "ok",
                application: "InkForge",
                version: "1.0.0"
            )
        }

        do {
            try await app.execute()
        } catch {
            try? await app.asyncShutdown()
            throw error
        }

        try await app.asyncShutdown()
    }
}
