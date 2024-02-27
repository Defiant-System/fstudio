<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">


<xsl:template name="blank-view">
	<h2>Welcome to Glyphr Studio.</h2>

	<div class="block-buttons">
		<div class="btn" data-click="open-file">
			<i class="icon-folder-open"></i>
			Open&#8230;
		</div>

		<div class="btn disabled_" data-click="from-clipboard">
			<i class="icon-clipboard"></i>
			From clipboard
		</div>
	</div>

	<div class="block-samples" data-click="select-sample">
		<h3>Samples</h3>
		<xsl:call-template name="sample-list" />
	</div>

	<xsl:if test="count(./Recents/*) &gt; 0">
		<div class="block-recent" data-click="select-recent-file">
			<h3>Recent</h3>
			<xsl:call-template name="recent-list" />
		</div>
	</xsl:if>
</xsl:template>


<xsl:template name="sample-list">
	<xsl:for-each select="./Samples/*">
		<div class="sample">
			<xsl:attribute name="style">background-image: url(<xsl:value-of select="@img"/>);</xsl:attribute>
			<span class="name"><xsl:value-of select="@path"/></span>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="recent-list">
	<xsl:for-each select="./Recents/*">
		<div class="recent-file">
			<xsl:attribute name="data-file"><xsl:value-of select="@path"/></xsl:attribute>
			<span class="thumbnail">
				<xsl:attribute name="style">background-image: url(<xsl:value-of select="@img"/>);</xsl:attribute>
			</span>
			<span class="name"><xsl:value-of select="@path"/></span>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="overview-tree">
	<xsl:variable name="file" select="ancestor::Data/Files/File"/>
	<xsl:for-each select="./Group">
		<legend><xsl:value-of select="@name"/></legend>
		<div class="list-wrapper">
			<ul>
				<xsl:for-each select="./i">
				<li>
					<xsl:attribute name="data-sets"><xsl:value-of select="@sets"/></xsl:attribute>
					<xsl:if test="@state = 'disabled'"><xsl:attribute name="class">disabled</xsl:attribute></xsl:if>
					<i>
						<xsl:attribute name="class"><xsl:value-of select="@icon"/></xsl:attribute>
					</i>
					<span><xsl:value-of select="@name"/></span>
				</li>
				</xsl:for-each>
			</ul>
		</div>
	</xsl:for-each>
	<div class="font-details">
		<div class="field">
			<span>Name</span>
			<span><xsl:value-of select="$file/@name"/></span>
		</div>
		<div class="field">
			<span>Style</span>
			<span><xsl:value-of select="$file/@style"/></span>
		</div>
		<div class="field">
			<span>Glyphs</span>
			<span><xsl:value-of select="$file/@glyphs"/></span>
		</div>
		<div class="field">
			<span>File</span>
			<span><xsl:value-of select="$file/@filename"/></span>
		</div>
		<div class="field">
			<span>Size</span>
			<span><xsl:value-of select="$file/@size"/></span>
		</div>
	</div>
</xsl:template>


<xsl:template name="glyph-list">
	<div class="glyph-list">
		<xsl:for-each select="./Set">
			<h2><xsl:value-of select="@name"/></h2>
			<xsl:for-each select="./*">
				<xsl:variable name="char" select="ancestor::Data/Unicode/*[@id = current()/@id]" />
				<div class="glyph">
					<xsl:if test="$char/@type = 'ws'"><xsl:attribute name="class">glyph white-space</xsl:attribute></xsl:if>
					<xsl:attribute name="title"><xsl:value-of select="$char/@name"/></xsl:attribute>
					<xsl:attribute name="data-id"><xsl:value-of select="$char/@id"/></xsl:attribute>
					<span class="thumbnail"><xsl:value-of select="$char/@value"/></span>
					<span class="name">
						<xsl:value-of select="$char/@value"/>
						<xsl:if test="$char/@type = 'ws'"><xsl:value-of select="$char/@name"/></xsl:if>
					</span>
				</div>
			</xsl:for-each>
		</xsl:for-each>
	</div>
</xsl:template>

</xsl:stylesheet>