'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type PromptProps = {
    label: string;
    path?: string;
    type?: string;
    newTab?: boolean;
    nest?: string;
};

export type PromptsContextProps = {
    prompts: PromptProps[];
    setPrompts: React.Dispatch<React.SetStateAction<PromptProps[]>>;
    selected: number;
    setSelected: React.Dispatch<React.SetStateAction<number>>;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    menu: string;
    setMenu: React.Dispatch<React.SetStateAction<string>>;
};

const PromptsContext = createContext<PromptsContextProps>({
    prompts: [{ label: '', path: '' }],
    setPrompts: () => null,
    selected: 0,
    setSelected: () => null,
    open: false,
    setOpen: () => null,
    menu: '',
    setMenu: () => null,
});

export function usePrompts() {
    return useContext(PromptsContext);
}

export function PromptsProvider({ children }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [prompts, setPrompts] = useState<PromptProps[]>([]);
    const startIndex = -1;
    const [selected, setSelected] = useState<number>(startIndex);
    const [menu, setMenu] = useState('');

    useEffect(() => {
        function selectNext(event: KeyboardEvent) {
            // FIXME: Combine with event handler in Console
            if (open) {
                return;
            }

            if (event.key === 'ArrowDown' && !event.metaKey) {
                event.preventDefault();

                setSelected((prev) => {
                    const selected = prev < prompts.length - 1 ? prev + 1 : 0;

                    return selected;
                });

                return;
            }

            if (event.key === 'ArrowUp' && !event.metaKey) {
                event.preventDefault();

                setSelected((prev) => {
                    const selected = prev > 0 ? prev - 1 : prompts.length - 1;

                    return selected;
                });

                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();

                if (!prompts[selected]?.path) {
                    return;
                }

                if (prompts[selected].newTab) {
                    window.open(prompts[selected].path);
                } else {
                    router.push(prompts[selected].path!);
                }
            }

            if (event.key === ' ') {
                event.preventDefault();

                setMenu('Start');
                setOpen((prev) => {
                    if (menu === 'Start') {
                        return !prev;
                    } else {
                        return true;
                    }
                });
            }

            if (event.key === 'Escape') {
                event.preventDefault();

                setMenu('Select');
                setOpen((prev) => {
                    if (menu === 'Select') {
                        return !prev;
                    } else {
                        return true;
                    }
                });
            }
        }

        window.addEventListener('keydown', selectNext);

        return () => window.removeEventListener('keydown', selectNext);
    }, [menu, open, prompts, router, selected, setOpen, setSelected]);

    useEffect(() => {
        if (open) {
            document.body.classList.add('no-scroll');
            document.querySelector('[data-page]')?.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
            document
                .querySelector('[data-page]')
                ?.classList.remove('no-scroll');
        }
    }, [open]);

    return (
        <PromptsContext.Provider
            value={{
                prompts,
                setPrompts,
                selected,
                setSelected,
                open,
                setOpen,
                menu,
                setMenu,
            }}
        >
            {children}
        </PromptsContext.Provider>
    );
}
