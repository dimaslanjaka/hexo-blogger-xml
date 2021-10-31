interface JSON {
    /**
     * safely handles circular references
     * @param obj
     * @param indent
     */
    safeStringify(obj: any, indent?: number): any;
}
