{
  description = "Portfolio site development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        nodejs = pkgs.nodejs_24;

        customNpm = pkgs.writeShellScriptBin "npm" ''
          ${nodejs}/bin/npm "$@"
        '';

      in {
        devShell = pkgs.mkShell {
          name = "portfolio-dev-shell";

          buildInputs = with pkgs; [
            nodejs
            customNpm
            yarn
            git
          ];

          shellHook = ''
            export PS1="\[\033[1;36m\][portfolio-dev]\[\033[0m\] \[\033[1;32m\]\u@\h\[\033[0m\] \[\033[1;34m\]\w\[\033[0m\] \$ "

            echo "Node.js version: $(${nodejs}/bin/node --version)"
            echo "npm version: $(${customNpm}/bin/npm --version)"
            echo "Portfolio dev environment ready. Run 'npm run dev' to start."
          '';
        };
      }
    );
}
