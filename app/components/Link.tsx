'use client';

import NextLink from 'next/link';
import { ReactNode } from 'react';

interface LinkProps {
    href?: string;
    to?: string;
    children: ReactNode;
    className?: string;
    onClick?: (e?: any) => void;
    [key: string]: any;
}

export default function Link({ href, to, children, ...props }: LinkProps) {
    const targetHref = href || to || '#';
    return (
        <NextLink href={targetHref} {...props}>
            {children}
        </NextLink>
    );
}
