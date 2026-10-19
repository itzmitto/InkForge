// swift-tools-version: 6.4
import PackageDescription

let package = Package(
    name: "InkForgeServer",
    products: [
        .executable(
            name: "InkForgeServer",
            targets: ["InkForgeServer"]
        )
    ],
    dependencies: [
        .package(
            url: "https://github.com/vapor/vapor.git",
            from: "4.122.2"
        )
    ],
    targets: [
        .executableTarget(
            name: "InkForgeServer",
            dependencies: [
                .product(name: "Vapor", package: "vapor")
            ]
        ),
        .testTarget(
            name: "InkForgeServerTests",
            dependencies: ["InkForgeServer"]
        )
    ]
)