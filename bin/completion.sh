
###-begin-nrun-completion-###
#
# nrun command completion script
#
# Based on
# http://srackham.wordpress.com/2012/06/17/bash-completion-for-jake-files/
#

function _nrun_completion() {
    local cur tasks
    _get_comp_words_by_ref -n : cur
    # The sed command strips terminal escape sequences.
    tasks=$(nrun | grep '^  [a-zA-Z0-9:-]*$' | awk '{print $1}')
    if [[ $COMP_LINE =~ ^${COMP_WORDS[0]}\ [^\ ]+\  ]]; then
        COMPREPLY=( $(compgen -f "$cur") )
    else
        # Task name completion for first argument.
        COMPREPLY=( $(compgen -W "$tasks" "$cur") )
        __ltrim_colon_completions "$cur"
    fi
}
complete -F _nrun_completion nrun
###-end-nrun-completion-###
