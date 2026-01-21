script_folder="/Users/rmac/Documents/metabuilder/frontends/cli"
echo "echo Restoring environment" > "$script_folder/deactivate_conanbuildenv-release-armv8.sh"
for v in PATH
do
   is_defined="true"
   value=$(printenv $v) || is_defined="" || true
   if [ -n "$value" ] || [ -n "$is_defined" ]
   then
       echo export "$v='$value'" >> "$script_folder/deactivate_conanbuildenv-release-armv8.sh"
   else
       echo unset $v >> "$script_folder/deactivate_conanbuildenv-release-armv8.sh"
   fi
done

export PATH="/Users/rmac/.conan2/p/cmake253f38c8fbec3/p/CMake.app/Contents/bin:$PATH"