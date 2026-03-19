{
  description = "TanStack Start + Nitro + Deno (local dev: Node, pnpm, Deno)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      eachSystem =
        f:
        nixpkgs.lib.genAttrs
          [
            "aarch64-darwin"
            "x86_64-darwin"
            "aarch64-linux"
            "x86_64-linux"
          ]
          (system: f (import nixpkgs { inherit system; }));
    in
    {
      devShells = eachSystem (pkgs: {
        default = pkgs.mkShellNoCC {
          packages = with pkgs; [
            nodejs_22
            pnpm
            deno
          ];
        };
      });
    };
}
