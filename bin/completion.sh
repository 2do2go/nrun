
###-begin-nrun-completion-###
#
# nrun command completion script
#
# Based on
# http://srackham.wordpress.com/2012/06/17/bash-completion-for-jake-files/
#

function _nrun_completion() {
    local cur tasks
    cur=${COMP_WORDS[COMP_CWORD]}
    # The sed command strips terminal escape sequences.
    tasks=$(nrun | grep '^  [a-zA-Z0-9]*$' | awk '{print $1}')
    if [ $COMP_CWORD -eq 1 ]; then
        # Task name completion for first argument.
        COMPREPLY=( $(compgen -W "$tasks" "$cur") )
    else
        # File name completion for other arguments.
        COMPREPLY=( $(compgen -f "$cur") )
    fi
}
complete -F _nrun_completion nrun
###-end-nrun-completion-###
